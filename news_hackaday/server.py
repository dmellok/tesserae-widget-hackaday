"""news_hackaday — latest articles from Hackaday's public RSS feed.

Pulls https://hackaday.com/feed/, slims each item to {title, url,
published, author, image}, and caches the result for 15 minutes so
a busy refresh cadence doesn't hammer the upstream feed.

Hackaday's feed carries enough metadata that we don't need scraping:
- title / link / pubDate from the standard RSS item.
- dc:creator from the Dublin Core namespace for the author.
- media:content for the featured image URL (used by the lg layout).

Pure stdlib XML parsing. No `feedparser`, no extra deps. Same pattern
as the bundled news_rss widget, with the extra fields lifted for
Hackaday's richer item shape.
"""

from __future__ import annotations

import contextlib
import json
import time
import urllib.request
from datetime import UTC, datetime
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET

FEED_URL = "https://hackaday.com/feed/"
CACHE_TTL_S = 900  # 15 minutes; Hackaday posts a few times per day
HTTP_TIMEOUT_S = 15
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


def _slim_items(channel: ET.Element, max_items: int) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for item in channel.findall("item")[:max_items]:
        title_el = item.find("title")
        link_el = item.find("link")
        date_el = item.find("pubDate")
        creator_el = item.find(f"{DC_NS}creator")
        media_el = item.find(f"{MEDIA_NS}content")
        when = _parse_when(date_el.text if date_el is not None else "")
        items.append(
            {
                "title": (title_el.text or "").strip() if title_el is not None else "",
                "url": (link_el.text or "").strip() if link_el is not None else "",
                "published": when.isoformat() if when else "",
                "author": (creator_el.text or "").strip() if creator_el is not None else "",
                "image": media_el.attrib.get("url", "") if media_el is not None else "",
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
