/* =========================================================
   contact.js — Contact page
   A short intro line, the email very large, then phone /
   location / socials, and an optional full-width photo.
   ========================================================= */
import { getJSON, getSettings, src, esc, buildHeader, buildFooter, showError } from "./common.js";

buildHeader("contact");
buildFooter();

const main = document.getElementById("main");

try {
  const [c, s] = await Promise.all([getJSON("content/contact.json"), getSettings()]);
  const socials = [["Instagram", s.instagram], ["YouTube", s.youtube], ["LinkedIn", s.linkedin]].filter(([, url]) => url);

  main.innerHTML = `
    <section class="contact">
      <p class="contact-intro">${esc(c.intro)}</p>
      <a class="contact-email" href="mailto:${esc(c.email)}">${esc(c.email)}</a>

      <div class="contact-details">
        <div>
          <h3 class="label">Phone</h3>
          <a href="tel:${esc((c.phone || "").replace(/\s/g, ""))}">${esc(c.phone)}</a>
        </div>
        <div>
          <h3 class="label">Location</h3>
          <p>${esc(c.location)}</p>
        </div>
        <div class="list">
          <h3 class="label">Follow</h3>
          ${socials.map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${name}</a>`).join("")}
        </div>
      </div>
    </section>
    ${c.image ? `<section class="contact-image"><img src="${esc(src(c.image))}" alt=""></section>` : ""}`;
} catch (err) {
  showError(main, err);
}
