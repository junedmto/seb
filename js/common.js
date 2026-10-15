/* =========================================================
   common.js — shared helpers used by every page
   - loading content files (the ones the admin edits)
   - building the header, mobile menu and footer
   - the justified gallery used on every page
   - turning Markdown text from the admin into HTML
   ========================================================= */

import { marked } from "https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js";

/* ---------- Loading content ---------- */

// Fetches a JSON file from the /content folder.
// "no-cache" asks the browser to check for a newer version, so edits
// made in the admin show up as soon as GitHub has published them.
export async function getJSON(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.json();
}

// The admin saves image paths like "/images/uploads/photo.webp".
// While the site lives at junedmto.github.io/seb/ a leading "/" would point
// to the wrong place, so we strip it and let the path resolve relative to
// the current page. Full URLs (https://…) are left untouched.
export function src(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return path.replace(/^\/+/, "");
}

// Image lists can be saved either as plain strings or as {image: "..."}
// objects depending on the admin field type — accept both.
export function imageList(list) {
  return (list || []).map((x) => (typeof x === "string" ? x : x && x.image)).filter(Boolean);
}

// Markdown (from the admin's rich text fields) -> HTML
export function md(text) {
  return marked.parse(text || "", { breaks: false });
}

// Makes text safe to put inside HTML
export function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Site settings (cached so every page loads them once) ---------- */
let settingsPromise;
export function getSettings() {
  settingsPromise ??= getJSON("content/settings.json");
  return settingsPromise;
}

/* ---------- Social icons (simple line icons, coloured by the text colour) ---------- */
const ICONS = {
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10 9.2v5.6l5-2.8z" fill="currentColor" stroke="none"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M8 10.5V17M8 7.3v.2M11.8 17v-6.5M11.8 13.4c0-1.8 1.1-2.9 2.6-2.9s2.4 1 2.4 2.9V17" stroke-linecap="round"/></svg>`,
};

/* ---------- Header ---------- */
// `active` is the name of the current page so its link is underlined.
export async function buildHeader(active) {
  const s = await getSettings();
  const pages = [
    ["projects", "Projects", "index.html"],
    ["photography", "Photography", "photography.html"],
    ["about", "About", "about.html"],
    ["contact", "Contact", "contact.html"],
  ];
  const socials = ["instagram", "youtube", "linkedin"]
    .filter((k) => s[k])
    .map((k) => `<a href="${esc(s[k])}" target="_blank" rel="noopener" aria-label="${k}">${ICONS[k]}</a>`)
    .join("");

  const header = document.getElementById("site-header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="brand">
      <a class="logo" href="index.html">${esc(s.site_title)}</a>
      <span class="tagline tagline-mobile"></span>
    </div>
    <span class="tagline tagline-desktop">${esc(s.tagline)}</span>
    <button class="menu-btn" aria-label="Menu"><span></span><span></span><span></span></button>
    <nav class="nav">
      ${pages.map(([key, label, href]) => `<a class="link ${key === active ? "active" : ""}" href="${href}">${label}</a>`).join("")}
      <div class="socials">${socials}</div>
    </nav>`;

  // On small screens the tagline moves under the name (see CSS section 10)
  const mq = window.matchMedia("(max-width: 900px)");
  const placeTagline = () => {
    header.querySelector(".tagline-mobile").textContent = mq.matches ? s.tagline : "";
    header.querySelector(".tagline-desktop").style.display = mq.matches ? "none" : "";
  };
  placeTagline();
  mq.addEventListener("change", placeTagline);

  // Hamburger menu
  header.querySelector(".menu-btn").addEventListener("click", () => document.body.classList.toggle("menu-open"));

  // Page title in the browser tab
  document.title = document.title ? `${document.title} — ${s.site_title}` : s.site_title;
  // Description for Google (edited in Site settings)
  if (s.seo_description) document.querySelector('meta[name="description"]')?.setAttribute("content", s.seo_description);
}

/* ---------- Footer ---------- */
export async function buildFooter() {
  const s = await getSettings();
  const footer = document.getElementById("site-footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <span>© ${new Date().getFullYear()} ${esc(s.site_title)}</span>
    <a href="#" onclick="window.scrollTo({top:0,behavior:'smooth'});return false;">Back to top</a>`;
}

/* ---------- Gallery ---------- */
/*
  buildGallery(container, images, options)
    images  : array of { src, href?, alt? }
    options :
      perRow    – images per row (set in the admin)
      mobileMax – max images per row on phones (default 2)
      onClick   – function(index) called when an image is clicked
                  (used by the photography lightbox). If an image has
                  an href instead, it works as a normal link.

  How it works: images are split into rows of `perRow`. Each tile gets
  flex-grow = its aspect ratio, so every image in a row is the same height
  and the row fills the full width. The last row is stretched too.
*/
const MOBILE = window.matchMedia("(max-width: 700px)");
const ratios = new Map(); // remembers each image's aspect ratio once loaded

export function buildGallery(container, images, { perRow = 3, mobileMax = 2, onClick } = {}) {
  container.classList.add("gallery");

  const render = () => {
    const n = Math.max(1, MOBILE.matches ? Math.min(perRow, mobileMax) : perRow);
    container.innerHTML = "";
    for (let i = 0; i < images.length; i += n) {
      const row = document.createElement("div");
      row.className = "gallery-row";
      images.slice(i, i + n).forEach((item, j) => row.appendChild(tile(item, i + j)));
      updateRow(row);
      container.appendChild(row);
    }
  };

  const tile = (item, index) => {
    const el = document.createElement(item.href ? "a" : "div");
    el.className = "gallery-item";
    if (item.href) el.href = item.href;
    const ar = ratios.get(item.src) || 1.5; // guess 3:2 until the image loads
    setRatio(el, ar);

    const img = new Image();
    img.alt = item.alt || "";
    img.decoding = "async";
    img.loading = index < 6 ? "eager" : "lazy";
    img.onload = () => {
      const real = img.naturalWidth / img.naturalHeight;
      ratios.set(item.src, real);
      setRatio(el, real);
      img.classList.add("loaded");
    };
    img.src = item.src;
    el.appendChild(img);

    if (onClick) el.addEventListener("click", (e) => { e.preventDefault(); onClick(index); });
    return el;
  };

  render();
  MOBILE.addEventListener("change", render); // re-flow when crossing the phone breakpoint
}

// Sets a tile's share of the row width, then sizes the row so its height
// is exactly (row width ÷ sum of ratios) — every image shown whole.
function setRatio(el, ar) {
  el.dataset.ar = ar;
  el.style.flexGrow = ar;
  const row = el.parentElement;
  if (row) updateRow(row);
}
function updateRow(row) {
  const sum = [...row.children].reduce((t, c) => t + Number(c.dataset.ar || 1.5), 0);
  row.style.aspectRatio = sum;
}

/* ---------- Simple "something went wrong" message ---------- */
export function showError(el, err) {
  console.error(err);
  el.innerHTML = `<p style="padding:40px var(--pad);color:var(--muted)">Sorry — this page couldn't load.</p>`;
}
