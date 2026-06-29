// news_hackaday — Hackaday's RSS, dressed in the Jolly Wrencher.
//
// Two layouts, chosen via the `layout` cell option:
//   list  — N headlines with author bylines and time-ago chips
//   hero  — featured image + title + author + time on top,
//           plus a slim list of the remaining headlines below
//
// The Jolly Wrencher is embedded inline so the widget doesn't fetch
// the brand mark from the upstream site at render time. Black on the
// "paper" surface so it reads sharply on mono and Spectra 6 panels.

const JOLLY_WRENCHER_SVG = `
<svg viewBox="0 117.2 612 558" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g transform="translate(-5.0625,-17.9375)" fill="currentColor">
    <path d="M83,135.1c-7.2,0-14.1,1.1-20.7,3l48.8,43.5l-54.7,60.6L6.6,198c-1.1,4.9-1.5,9.9-1.5,15.2c0,43.1,35,77.9,77.9,77.9c8.2,0,16-1.3,23.6-3.8l62.9,55.9c12-26,29.8-48.3,51.3-64.8l-60.8-53.8c0.6-3.8,0.8-7.6,0.8-11.4v-0.4C160.7,169.7,125.9,135.1,83,135.1z M457.8,488.1c-10.1,27-26.2,50.7-46.4,69l50.9,45c-0.6,4.2-1.1,8.4-1.1,12.9c0,43.1,35,77.9,77.9,77.9c7.8,0,15.2-1.3,22.4-3.4l-50.9-45.2l54.5-60.4l50.5,44.8c0.8-4.6,1.3-9.3,1.3-14.1v-0.6c-0.4-42.9-35.3-77.3-77.9-77.3c-7.8,0-15.4,1.1-22.4,3.4L457.8,488.1z"/>
    <path d="M539,135.1c-42.9,0-77.7,34.6-77.9,77.5v0.4c0,3.8,0.2,7.8,0.8,11.4l-60.8,53.8c21.7,16.5,39.3,38.8,51.3,64.8l63.1-55.7c7.4,2.3,15.4,3.8,23.6,3.8c43.1,0,77.9-35,77.9-77.9c0-5.3-0.6-10.3-1.5-15.2l-49.8,44.1l-54.7-60.8l48.8-43.5C553.2,136.1,546.2,135.1,539,135.1z M164.3,488.1l-58.9,52.1c-7.2-2.1-14.6-3.4-22.4-3.4c-42.9,0-77.7,34.4-77.9,77.3v0.6c0,4.9,0.4,9.5,1.3,14.1l50.5-44.8l54.5,60.4l-50.9,45.2c7.2,2.1,14.6,3.4,22.4,3.4c43.1,0,77.9-35,77.9-77.9c0-4.4-0.4-8.7-1.1-12.9l50.9-45C190.5,538.7,174.4,515.1,164.3,488.1z"/>
    <path d="M311,260.9c-80.4,0-145.7,72.2-145.7,161.5c0,55.1,24.9,103.9,63.1,133c-2.5,4.2-4,9.3-4,14.6c0,15.6,12.5,28.5,27.9,28.5s27.9-12.7,27.9-28.5c0-1.1,0-2.1-0.2-3.4h3.8c-0.2,1.5-0.4,2.7-0.4,4.2c0,15.2,12.2,27.4,27.4,27.4c15.2,0,27.4-12.2,27.4-27.4c0-1.5-0.2-3-0.4-4.2h4.9c-0.2,1.5-0.4,2.7-0.4,4.2c0,15.2,12.2,27.4,27.4,27.4s27.4-12.2,27.4-27.4c0-5.5-1.7-10.8-4.6-15.2c38.8-28.9,64.2-77.9,64.2-133.2C456.7,333.1,391.5,260.9,311,260.9z M248.3,381.5c8.2,0,16.5,2.5,23.4,6.8c5.9,4.4,10.8,10.3,14.4,16.9c3.2,8-1.3,17.3-7.8,22.4c-4.9,3.4-9.7,7.2-15.6,8.9c-7.2,2.3-13.9,5.7-20.7,9.1c-3.4,1.9-5.7,4.6-6.5,8.2c-2.3,3.8-0.2,8.9-2.7,12.2c-3.8,2.7-8.2-0.6-11.2-3c-6.5-4.9-12.5-11.6-14.1-19.6c-1.3-7-2.7-13.9-1.9-21.1c0-8.7,4.2-16.5,9.5-23c5.9-8.2,14.8-15.2,25.1-16.5C243.1,381.7,245.8,381.5,248.3,381.5z M373.7,381.5c2.7,0,5.5,0.2,8,0.8c10.3,1.3,19,8.2,25.1,16.5c5.3,6.5,9.5,14.6,9.5,23c0.8,7.2-0.6,14.1-1.9,21.1c-1.7,8.2-7.4,15-14.1,19.6c-3,2.3-7.4,5.7-11.2,3c-2.5-3.4-0.4-8.4-2.7-12.2c-0.8-3.8-3.4-6.5-6.5-8.2c-6.8-3.4-13.5-6.8-20.7-9.1c-5.9-1.7-10.6-5.5-15.6-8.9c-6.5-5.1-10.8-14.1-7.8-22.4c3.6-6.5,8.2-12.5,14.4-16.9C357.3,384,365.5,381.2,373.7,381.5z M311.5,464.2c7.8,0.2,15.4,32.5,13.5,45.4c-6.5,19.2-5.3-12.5-13.5-12.9c-8.7,0-10.1,31.2-14.6,12.9C295.4,495.7,304.5,464,311.5,464.2z"/>
  </g>
</svg>
`;

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function fmtAgo(iso) {
  if (typeof iso !== "string" || !iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const secs = Math.max(0, (Date.now() - t) / 1000);
  if (secs < 60) return "now";
  if (secs < 3600) return `${Math.max(1, Math.floor(secs / 60))}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d`;
  return `${Math.floor(secs / 604800)}w`;
}

function bytesToImgSrc(url) {
  // Hackaday's CDN serves through `?w=` resizing; ask for a comfortably
  // sized version so the renderer doesn't over-dither a 1600px hero
  // into a 480px cell.
  if (!url) return "";
  try {
    const u = new URL(url);
    u.searchParams.set("w", "800");
    return u.toString();
  } catch {
    return url;
  }
}

export default function render(shadow, ctx) {
  const data = ctx?.data ?? {};
  const opts = ctx?.options ?? {};
  const css = `<link rel="stylesheet" href="/static/style/spectra-widgets.css">`;

  const headerLabel = data.label || "Hackaday";
  const showAuthor = opts.show_author !== false;
  const layout = opts.layout === "hero" ? "hero" : "list";

  const titleBar = `
    <div class="w-title hd-title">
      <span class="hd-wrencher" aria-hidden="true">${JOLLY_WRENCHER_SVG}</span>
      <h3>${escapeHtml(headerLabel)}</h3>
      <span class="w-title-meta">LATEST</span>
    </div>`;

  if (data.error) {
    shadow.innerHTML = `
      ${css}
      <style>${layoutCss()}</style>
      <div class="w" data-widget="news_hackaday">
        ${titleBar}
        <div class="w-body"><p class="u-muted">${escapeHtml(data.error)}</p></div>
      </div>`;
    return;
  }

  const items = Array.isArray(data.items) ? data.items : [];
  if (items.length === 0) {
    shadow.innerHTML = `
      ${css}
      <style>${layoutCss()}</style>
      <div class="w" data-widget="news_hackaday">
        ${titleBar}
        <div class="w-body"><p class="u-muted">No articles in the feed right now.</p></div>
      </div>`;
    return;
  }

  // Hero layout — featured image up top + list of the rest.
  if (layout === "hero") {
    const hero = items[0];
    const rest = items.slice(1);
    const heroImg = hero.image
      ? `<div class="hd-hero-img"><img src="${escapeHtml(bytesToImgSrc(hero.image))}" alt="" loading="lazy"></div>`
      : "";
    const heroBlock = `
      <div class="hd-hero">
        ${heroImg}
        <div class="hd-hero-body">
          <p class="hd-hero-title">${escapeHtml(hero.title)}</p>
          <p class="hd-hero-meta">
            ${showAuthor && hero.author ? `<span class="hd-author">${escapeHtml(hero.author)}</span><span class="hd-dot">·</span>` : ""}
            <span class="hd-ago">${escapeHtml(fmtAgo(hero.published))}</span>
          </p>
        </div>
      </div>`;
    const rows = rest.map((it, i) => `
      <div class="hd-row ${i % 2 ? "is-zebra" : ""}">
        <span class="hd-bullet" aria-hidden="true"></span>
        <span class="hd-row-title">${escapeHtml(it.title)}</span>
        <span class="hd-ago">${escapeHtml(fmtAgo(it.published))}</span>
      </div>`).join("");

    shadow.innerHTML = `
      ${css}
      <style>${layoutCss()}</style>
      <div class="w" data-widget="news_hackaday">
        ${titleBar}
        <div class="w-body hd-lg">
          ${heroBlock}
          ${rest.length ? `<div class="hd-list">${rows}</div>` : ""}
        </div>
      </div>`;
    return;
  }

  // List layout — N headlines with optional author byline + age.
  const rows = items.map((it, i) => `
    <div class="hd-row ${i % 2 ? "is-zebra" : ""}">
      <span class="hd-bullet" aria-hidden="true"></span>
      <div class="hd-row-main">
        <span class="hd-row-title">${escapeHtml(it.title)}</span>
        ${showAuthor && it.author ? `<span class="hd-row-author">${escapeHtml(it.author)}</span>` : ""}
      </div>
      <span class="hd-ago">${escapeHtml(fmtAgo(it.published))}</span>
    </div>`).join("");

  shadow.innerHTML = `
    ${css}
    <style>${layoutCss()}</style>
    <div class="w" data-widget="news_hackaday">
      ${titleBar}
      <div class="w-body list-body">${rows}</div>
    </div>`;
}

function layoutCss() {
  return `
    .hd-title { gap: var(--space-2); }
    .hd-wrencher {
      display: inline-flex;
      align-items: center;
      width: 1.4em;
      height: 1.4em;
      color: var(--text-primary);
      flex: 0 0 auto;
    }
    .hd-wrencher svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .hd-sm {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-3);
    }
    .hd-sm-title {
      font-size: var(--fs-lead);
      font-weight: var(--fw-bold);
      line-height: 1.25;
      margin: 0;
    }
    .hd-sm-meta {
      color: var(--text-muted);
      font-size: var(--fs-caption);
      font-weight: var(--fw-bold);
      letter-spacing: var(--ls-label);
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .hd-dot { opacity: 0.5; }
    .hd-lg {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding: var(--space-3);
    }
    .hd-hero {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .hd-hero-img {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      border-radius: var(--radius-1);
      background: color-mix(in oklab, var(--text-primary) 8%, transparent);
    }
    .hd-hero-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .hd-hero-title {
      font-size: var(--fs-lead);
      font-weight: var(--fw-bold);
      line-height: 1.2;
      margin: 0;
    }
    .hd-hero-meta {
      color: var(--text-muted);
      font-size: var(--fs-caption);
      font-weight: var(--fw-bold);
      letter-spacing: var(--ls-label);
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .hd-author { text-transform: none; }
    .hd-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .hd-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-1);
      min-width: 0;
    }
    .hd-row.is-zebra {
      background: color-mix(in oklab, var(--text-primary) 3%, transparent);
    }
    .hd-row-main {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      overflow: hidden;
    }
    .hd-row-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1 1 auto;
    }
    .hd-row-author {
      color: var(--text-muted);
      font-size: var(--fs-caption);
      font-weight: var(--fw-bold);
      letter-spacing: var(--ls-label);
      flex: 0 0 auto;
    }
    .hd-bullet {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--text-primary);
      flex: 0 0 auto;
      opacity: 0.5;
    }
    .hd-ago {
      color: var(--text-muted);
      font-weight: var(--fw-bold);
      font-size: var(--fs-caption);
      font-variant-numeric: tabular-nums;
      letter-spacing: var(--ls-label);
      flex: 0 0 auto;
    }
    @container (max-width: 280px) {
      .hd-row-author { display: none; }
    }
  `;
}
