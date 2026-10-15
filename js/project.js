/* =========================================================
   project.js — single project page (project.html?p=<name>)
   1. Full-width YouTube video: autoplays muted, first click = sound on
   2. Large title + description
   3. Photo gallery
   4. Previous / next project (follows the homepage order)
   ========================================================= */
import { getJSON, src, imageList, md, esc, buildHeader, buildFooter, buildGallery, showError } from "./common.js";

const main = document.getElementById("main");
const slug = new URLSearchParams(location.search).get("p");

try {
  if (!slug) throw new Error("No project given");
  const [p, home] = await Promise.all([
    getJSON(`content/projects/${slug}.json`),
    getJSON("content/home.json"),
  ]);

  document.title = p.title || "";
  buildHeader("projects");
  buildFooter();

  const videoId = youtubeId(p.youtube);

  main.innerHTML = `
    ${videoId ? `
    <section class="video-wrap">
      <div id="player"></div>
      <div class="sound-layer" title="Turn sound on"><span class="sound-hint">🔇 Click for sound</span></div>
    </section>` : ""}
    <section class="project-info">
      <h1 class="project-title">${esc(p.title)}</h1>
      <div class="project-desc">${md(p.description)}</div>
    </section>
    <section id="gallery"></section>
    <nav class="project-nav" id="project-nav"></nav>`;

  // Photo gallery
  const images = imageList(p.gallery).map((s) => ({ src: src(s), alt: p.title }));
  buildGallery(document.getElementById("gallery"), images, { perRow: p.per_row || 3 });

  // Previous / next (wraps around at the ends)
  buildPrevNext(home, slug);

  if (videoId) setupVideo(videoId);
} catch (err) {
  buildHeader("projects");
  buildFooter();
  showError(main, err);
}

/* ---------- YouTube ---------- */

// Accepts any kind of YouTube link (watch?v=, youtu.be/, /embed/, /shorts/)
// or just the 11-character video ID, and returns the ID.
function youtubeId(url) {
  if (!url) return "";
  url = url.trim();
  if (/^[\w-]{11}$/.test(url)) return url;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : "";
}

function setupVideo(id) {
  // Load YouTube's player script once; it calls onYouTubeIframeAPIReady when ready
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = () => {
    const player = new YT.Player("player", {
      videoId: id,
      playerVars: {
        autoplay: 1,      // start straight away…
        mute: 1,          // …muted (browsers only allow autoplay without sound)
        playsinline: 1,   // play in the page on iPhone instead of going full screen
        controls: 1,      // controls become usable once sound is turned on
        rel: 0,           // end-of-video suggestions only from the same channel
        modestbranding: 1,
        iv_load_policy: 3 // hide annotations
      },
      events: {
        onReady: (e) => { e.target.mute(); e.target.playVideo(); },
      },
    });

    // First click anywhere on the video: sound on, then get out of the way
    const layer = document.querySelector(".sound-layer");
    layer.addEventListener("click", () => {
      player.unMute();
      player.setVolume(100);
      player.playVideo();
      layer.remove();
    });
  };
}

/* ---------- Previous / next ---------- */
async function buildPrevNext(home, current) {
  const order = (home.projects || []).map((p) => p.project).filter(Boolean);
  const i = order.indexOf(current);
  const nav = document.getElementById("project-nav");
  if (i === -1 || order.length < 2) { nav.remove(); return; }

  const prevSlug = order[(i - 1 + order.length) % order.length];
  const nextSlug = order[(i + 1) % order.length];
  const [prev, next] = await Promise.all([prevSlug, nextSlug].map((s) => getJSON(`content/projects/${s}.json`).catch(() => ({ title: s }))));

  nav.innerHTML = `
    <a class="prev" href="project.html?p=${encodeURIComponent(prevSlug)}"><small>← Previous</small><strong>${esc(prev.title)}</strong></a>
    <a class="next" href="project.html?p=${encodeURIComponent(nextSlug)}"><small>Next →</small><strong>${esc(next.title)}</strong></a>`;
}
