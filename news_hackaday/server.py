"""news_hackaday — latest articles from Hackaday's public RSS feed.

Pulls https://hackaday.com/feed/, slims each item to {title, url,
published, author, image, image_proxy}, and caches the result for
15 minutes so a busy refresh cadence doesn't hammer the upstream
feed.

Hackaday's feed carries enough metadata that we don't need scraping:
- title / link / pubDate from the standard RSS item.
- dc:creator from the Dublin Core namespace for the author.
- media:content for the featured image URL (used by the hero layout).

Featured images are served through a same-origin proxy
(``/plugins/news_hackaday/image?u=...``) instead of pointing the
``<img src>`` at hackaday.com directly. The proxy hop sidesteps two
real-world failure modes:

* **Mixed-content blocking on iOS Safari.** Tesserae is usually served
  over HTTP on the LAN; the WordPress CDN behind Hackaday is HTTPS.
  Desktop browsers allow HTTPS subresources on HTTP pages; iOS Safari
  blocks them in some configurations.
* **Render-context network access.** Some host configurations restrict
  the headless renderer's outbound HTTP. The proxy keeps every fetch
  on the host side where network access is already known to work.

Only ``https://hackaday.com/...`` URLs are accepted by the proxy so
the route doesn't double as an open image relay.

Pure stdlib XML + HTTP parsing. No ``feedparser``, no extra deps.
"""

from __future__ import annotations

import contextlib
import json
import logging
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import UTC, datetime
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET

from flask import Blueprint, Response, abort, request

logger = logging.getLogger(__name__)

FEED_URL = "https://hackaday.com/feed/"
ALLOWED_IMAGE_PREFIX = "https://hackaday.com/"
CACHE_TTL_S = 900  # 15 minutes; Hackaday posts a few times per day
HTTP_TIMEOUT_S = 15
PROXY_TIMEOUT_S = 20
USER_AGENT = "tesserae/0.1 (+news_hackaday)"

DC_NS = "{http://purl.org/dc/elements/1.1/}"
MEDIA_NS = "{http://search.yahoo.com/mrss/}"


def _parse_when(s: str) -> datetime | None:
    if not s:
        return None
    s = s.strip()
    try:
        dt = parsedate_to_datetime(s)
        if dt and dt.tzinfo is None:
            dt = dt.replace(tzinfo=UTC)
        return dt
    except Exception:
        return None


def _proxy_url(image_url: str) -> str:
    """Build the same-origin proxy URL for a Hackaday image. Returns
    an empty string if the upstream URL isn't on hackaday.com (we
    won't proxy arbitrary hosts)."""
    if not image_url or not image_url.startswith(ALLOWED_IMAGE_PREFIX):
        return ""
    encoded = urllib.parse.quote(image_url, safe="")
    return f"/plugins/news_hackaday/image?u={encoded}"


def _slim_items(channel: ET.Element, max_items: int) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for item in channel.findall("item")[:max_items]:
        title_el = item.find("title")
        link_el = item.find("link")
        date_el = item.find("pubDate")
        creator_el = item.find(f"{DC_NS}creator")
        media_el = item.find(f"{MEDIA_NS}content")
        when = _parse_when(date_el.text if date_el is not None else "")
        image_url = media_el.attrib.get("url", "") if media_el is not None else ""
        items.append(
            {
                "title": (title_el.text or "").strip() if title_el is not None else "",
                "url": (link_el.text or "").strip() if link_el is not None else "",
                "published": when.isoformat() if when else "",
                "author": (creator_el.text or "").strip() if creator_el is not None else "",
                "image": image_url,
                "image_proxy": _proxy_url(image_url),
            }
        )
    return items


def fetch(
    options: dict[str, Any], settings: dict[str, Any], *, ctx: dict[str, Any]
) -> dict[str, Any]:
    del settings
    max_items = max(1, min(12, int(options.get("max_items") or 5)))
    label = (options.get("label") or "Hackaday").strip() or "Hackaday"

    data_dir = Path(ctx["data_dir"])
    data_dir.mkdir(parents=True, exist_ok=True)
    # max_items in the cache key so changing it in the editor refetches
    # the new size instead of serving a stale slice from a prior fetch.
    cache = data_dir / f"hackaday_{max_items}.json"
    if cache.exists() and time.time() - cache.stat().st_mtime < CACHE_TTL_S:
        try:
            cached = json.loads(cache.read_text(encoding="utf-8"))
            # Overlay user-editable label on every cache hit so a rename
            # in the editor takes effect immediately instead of waiting
            # for the TTL to expire.
            cached["label"] = label
            return cached
        except (json.JSONDecodeError, OSError):
            pass

    try:
        req = urllib.request.Request(FEED_URL, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT_S) as resp:
            blob = resp.read()
    except Exception as err:
        return {"error": f"{type(err).__name__}: {err}", "items": [], "label": label}

    try:
        root = ET.fromstring(blob)
    except ET.ParseError as err:
        return {"error": f"Bad XML: {err}", "items": [], "label": label}

    channel = root.find("channel")
    if channel is None:
        return {"error": "Feed has no <channel> element", "items": [], "label": label}

    items = _slim_items(channel, max_items)
    result = {"label": label, "items": items, "feed_url": FEED_URL}
    with contextlib.suppress(OSError):
        cache.write_text(json.dumps(result), encoding="utf-8")
    return result


# ----- image proxy blueprint -----------------------------------------


def blueprint() -> Blueprint:
    """Hosts the same-origin image proxy that the hero layout uses.
    Mounted by the host loader at ``/plugins/news_hackaday/``."""
    bp = Blueprint("news_hackaday_admin", __name__)

    @bp.get("/image")
    def serve_image() -> Response:
        """Proxy a Hackaday-hosted image so the cell loads it from
        the Tesserae origin instead of hackaday.com directly. Hard
        domain check so the route can't relay arbitrary upstreams."""
        url = request.args.get("u") or ""
        if not url or not url.startswith(ALLOWED_IMAGE_PREFIX):
            abort(404)

        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=PROXY_TIMEOUT_S) as upstream:
                body = upstream.read()
                ct = upstream.headers.get("Content-Type") or "image/jpeg"
        except (urllib.error.URLError, OSError) as exc:
            logger.info("news_hackaday: image fetch failed for %s: %s", url, exc)
            abort(502)

        resp = Response(body, mimetype=ct)
        # Cell paints once per frame; let the upstream's own caching
        # govern. Same-origin response means the browser doesn't need
        # CORS preflight regardless.
        resp.headers["Cache-Control"] = "public, max-age=900"
        return resp

    return bp
