# tesserae-widget-hackaday

Latest articles from [Hackaday](https://hackaday.com) on a Tesserae cell. Three layouts (small / medium / large) with the Jolly Wrencher in the header, per-article authors and time-ago chips, and featured images on the large layout.

## What it does

Pulls Hackaday's public RSS feed (`https://hackaday.com/feed/`) and renders the latest articles. Two layouts, picked per-cell:

- **List**: N headlines with author bylines and time-ago chips. The default; reads well at any cell size.
- **Hero**: featured image up top with title, author, time, plus a slim list of the remaining headlines below. Great for the large cells on a 7.3" PhotoPainter or 13.3" Spectra 6.

Pure RSS. No API key, no account, no upstream login. The feed is cached for 15 minutes server-side so a fast refresh cadence on your panel won't hammer Hackaday.

## Install

Via the Tesserae catalog: **Settings → Widgets → Browse → Hackaday**. One click.

Or follow the [host docs on installing a community widget](https://dmellok.github.io/tesserae/widgets/community/).

## Options

| Option | Default | Notes |
|---|---|---|
| Title | `Hackaday` | Header label. Override per cell if you want it to read differently. |
| Layout | `List of headlines` | Switch to `Hero with featured image` for the magazine-style card. |
| Max headlines | 5 | 1 to 12. |
| Show author byline | `true` | Author credit per article. |

## Why this widget exists

The Tesserae bundled catalog covers Hacker News, RSS, Wikipedia, and Reddit; Hackaday is a natural fit for the e-paper / hardware-hacking audience this project serves. Built on the same RSS pattern as the bundled `news_rss` widget, with the extra metadata (author, featured image) lifted from Hackaday's richer feed shape.

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE).
