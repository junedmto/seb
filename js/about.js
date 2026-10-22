/* =========================================================
   about.js — About page
   1. Full-width photo
   2. Large bio next to short lists (services, clients, gear…)
   3. Sponsors: logo grid (logos per row set in the admin)
   4. Client references: image, quote, name and title
   Everything is editable in the admin under Site → About page.
   ========================================================= */
import { getJSON, src, imageList, md, esc, buildHeader, buildFooter, showError } from "./common.js";

buildHeader("about");
buildFooter();

const main = document.getElementById("main");

try {
  const a = await getJSON("content/about.json");
  const logos = imageList(a.sponsors);
  const refs = a.references || [];

  main.innerHTML = `
    ${a.image ? `<section class="about-hero"><img src="${esc(src(a.image))}" alt=""></section>` : ""}

    <section class="about-grid">
      <div class="about-bio">${md(a.bio)}</div>
      ${(a.columns || []).map((c) => `
        <div class="about-col">
          <h3>${esc(c.heading)}</h3>
          ${md(c.text)}
        </div>`).join("")}
    </section>

    ${logos.length ? `
    <section class="about-section">
      <h3 class="label section-label">${esc(a.sponsors_heading || "Sponsors")}</h3>
      <div class="logo-grid" style="--per-row:${Number(a.sponsors_per_row) || 5}">
        ${logos.map((l) => `<div class="logo-cell"><img src="${esc(src(l))}" alt="" loading="lazy"></div>`).join("")}
      </div>
    </section>` : ""}

    ${refs.length ? `
    <section class="about-section">
      <h3 class="label section-label">${esc(a.references_heading || "Client references")}</h3>
      <div class="references">
        ${refs.map((r) => `
          <article class="reference">
            ${r.image ? `<div class="reference-img"><img src="${esc(src(r.image))}" alt="${esc(r.name)}" loading="lazy"></div>` : ""}
            <div class="reference-body">
              <div class="reference-text">${md(r.text)}</div>
              <p class="reference-name">${esc(r.name)}</p>
              <p class="reference-role">${esc(r.role)}</p>
            </div>
          </article>`).join("")}
      </div>
    </section>` : ""}`;
} catch (err) {
  showError(main, err);
}
