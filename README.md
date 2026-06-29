# tesserae-widget-hackaday

Latest articles from [Hackaday](https://hackaday.com) on a Tesserae cell. Three layouts (small / medium / large) with the Jolly Wrencher in the header, per-article authors and time-ago chips, and featured images on the large layout.

## What it does

Pulls Hackaday's public RSS feed (`https://hackaday.com/feed/`) and renders the latest articles:

- **Small**: most recent headline + author + time-ago.
- **Medium**: list of N recent headlines with author bylines.
- **Large**: hero card (featured image, title, author, time) plus a slim list of the remaining headlines.

Pure RSS. No API key, no account, no upstream login. The feed is cached for 15 minutes server-side so a fast refresh cadence on your panel won't hammer Hackaday.

## Install

Via the Tesserae catalog: **Settings → Widgets → Browse → Hackaday**. One click.

Or follow the [host docs on installing a community widget](https://dmellok.github.io/tesserae/widgets/community/).

## Options

| Option | Default | Notes |
|---|---|---|
| Title | `Hackaday` | Header label. Override per cell if you want it to read differently. |
| Max headlines | 5 | 1 to 12. |
| Show featured image (lg only) | `true` | Hero image on the large layout. Disable for a slimmer card. |
| Show author byline | `true` | Author credit per article. |

## Why this widget exists

The Tesserae bundled catalog covers Hacker News, RSS, Wikipedia, and Reddit; Hackaday is a natural fit for the e-paper / hardware-hacking audience this project serves. Built on the same RSS pattern as the bundled `news_rss` widget, with the extra metadata (author, featured image) lifted from Hackaday's richer feed shape.

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE).
