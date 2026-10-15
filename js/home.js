/* =========================================================
   home.js — Projects page (also the homepage)
   Reads the project order from content/home.json, loads each
   project's cover image, and shows them in the gallery.
   Clicking a cover opens project.html?p=<project-name>.
   ========================================================= */
import { getJSON, src, buildHeader, buildFooter, buildGallery, showError } from "./common.js";

buildHeader("projects");
buildFooter();

const main = document.getElementById("main");

try {
  const home = await getJSON("content/home.json");
  const slugs = (home.projects || []).map((p) => p.project).filter(Boolean);

  // Load all listed projects at the same time; skip any that were deleted
  const projects = await Promise.all(
    slugs.map((slug) => getJSON(`content/projects/${slug}.json`).then((p) => ({ ...p, slug })).catch(() => null))
  );

  const items = projects
    .filter((p) => p && p.cover)
    .map((p) => ({ src: src(p.cover), href: `project.html?p=${encodeURIComponent(p.slug)}`, alt: p.title }));

  const gallery = document.createElement("div");
  main.appendChild(gallery);
  // Covers contain their own titles, so on phones show one per row
  buildGallery(gallery, items, { perRow: home.per_row || 2, mobileMax: 1 });
} catch (err) {
  showError(main, err);
}
