/* =========================================================
   about.js — About page
   Full-width photo, then a large bio next to short lists
   (services, clients, gear…) — all editable in the admin.
   ========================================================= */
import { getJSON, src, md, esc, buildHeader, buildFooter, showError } from "./common.js";

buildHeader("about");
buildFooter();

const main = document.getElementById("main");

try {
  const a = await getJSON("content/about.json");
  main.innerHTML = `
    ${a.image ? `<section class="about-hero"><img src="${esc(src(a.image))}" alt=""></section>` : ""}
    <section class="about-grid">
      <div class="about-bio">${md(a.bio)}</div>
      ${(a.columns || []).map((c) => `
        <div class="about-col">
          <h3>${esc(c.heading)}</h3>
          ${md(c.text)}
        </div>`).join("")}
    </section>`;
} catch (err) {
  showError(main, err);
}
