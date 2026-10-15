/* =========================================================
   photography.js — Photography page
   Same gallery as the homepage, but clicking a photo opens it
   full screen (lightbox). Arrow keys / swipe to move, Esc to close.
   ========================================================= */
import { getJSON, src, imageList, buildHeader, buildFooter, buildGallery, showError } from "./common.js";

buildHeader("photography");
buildFooter();

const main = document.getElementById("main");

try {
  const data = await getJSON("content/photography.json");
  const images = imageList(data.images).map((s) => ({ src: src(s) }));

  const gallery = document.createElement("div");
  main.appendChild(gallery);

  const lb = createLightbox(images.map((i) => i.src));
  buildGallery(gallery, images, { perRow: data.per_row || 4, onClick: lb.open });
} catch (err) {
  showError(main, err);
}

/* ---------- Lightbox ---------- */
function createLightbox(list) {
  let index = 0;
  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = `
    <img alt="">
    <button class="lb-btn lb-close" aria-label="Close">Close</button>
    <button class="lb-btn lb-prev" aria-label="Previous">← Prev</button>
    <button class="lb-btn lb-next" aria-label="Next">Next →</button>
    <span class="lb-count"></span>`;
  document.body.appendChild(box);

  const img = box.querySelector("img");
  const count = box.querySelector(".lb-count");

  const show = (i) => {
    index = (i + list.length) % list.length;
    img.src = list[index];
    count.textContent = `${index + 1} / ${list.length}`;
    // preload the neighbours so moving through is instant
    [index + 1, index - 1].forEach((n) => { new Image().src = list[(n + list.length) % list.length]; });
  };
  const open = (i) => { show(i); box.classList.add("open"); document.body.classList.add("no-scroll"); };
  const close = () => { box.classList.remove("open"); document.body.classList.remove("no-scroll"); };

  box.querySelector(".lb-close").onclick = close;
  box.querySelector(".lb-prev").onclick = (e) => { e.stopPropagation(); show(index - 1); };
  box.querySelector(".lb-next").onclick = (e) => { e.stopPropagation(); show(index + 1); };
  box.addEventListener("click", (e) => { if (e.target === box) close(); }); // click outside the photo

  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(index + 1);
    if (e.key === "ArrowLeft") show(index - 1);
  });

  // Swipe on phones
  let startX = null;
  box.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });

  return { open };
}
