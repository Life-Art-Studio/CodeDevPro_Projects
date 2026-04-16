document.addEventListener("DOMContentLoaded", async () => {
  // =========================
  // NAVBAR FUNCTIONALITY
  // =========================

  const navbar = document.getElementById("navbar");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const navMenu = document.getElementById("nav-menu");
  const searchBtn = document.getElementById("search-btn");
  const searchContainer = document.querySelector(".search-container");
  const profileBtn = document.getElementById("profile-btn");
  const profileDropdown = document.getElementById("profile-dropdown");

  // Navbar Scroll Effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar?.classList.add("scrolled");
    } else {
      navbar?.classList.remove("scrolled");
    }
  });

  // Mobile Menu Toggle
  mobileMenuBtn?.addEventListener("click", () => {
    navMenu?.classList.toggle("active");

    const icon = mobileMenuBtn.querySelector("i");

    if (navMenu.classList.contains("active")) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-xmark");
    } else {
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-bars");
    }
  });

  // Search Toggle
  searchBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    searchContainer?.classList.toggle("active");

    if (searchContainer?.classList.contains("active")) {
      document.getElementById("search-input")?.focus();
    }
  });

  // Profile Dropdown
  profileBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown?.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!profileDropdown?.contains(e.target)) {
      profileDropdown?.classList.remove("active");
    }

    if (!searchContainer?.contains(e.target)) {
      searchContainer?.classList.remove("active");
    }
  });

  // =========================
  // PAGE DETECTION
  // =========================

  const currentPage = window.location.pathname;

  const grid = document.querySelector(".anime-grid");
  const viewAllBtn = document.querySelector(".view-all");

  // =========================
  // FETCH DATA
  // =========================

  let animeData;
  let allAnimeData;

  if (
    currentPage.includes("index.html") ||
    currentPage.includes("trending.html")
  ) {
    animeData = await getTopAnimeMovies();
  }

  if (currentPage.includes("browse.html")) {
    allAnimeData = await getAnime();
  }

  // =========================
  // VIEW ALL BUTTON
  // =========================

  viewAllBtn?.addEventListener("click", () => {
    window.location.href = "trending.html";
  });

  // =========================
  // RENDER PAGES
  // =========================

  if (grid) {
    if (currentPage.includes("index.html") || currentPage === "/") {
      renderAnime(animeData?.data?.slice(0, 6) || []);
    }

    if (currentPage.includes("trending.html")) {
      renderAnime(animeData?.data || []);
    }

    if (currentPage.includes("browse.html")) {
      renderAnime(allAnimeData?.data || []);
    }
  }

  // =========================
  // DETAILS PAGE LOADER
  // =========================

  if (currentPage.includes("anime-details.html")) {
    loadAnimeDetails();
  }

  // =========================
  // VIDEO PLAYER PAGE LOADER
  // =========================

  if (currentPage.includes("video-player.html")) {
    loadVideoPlayer();
  }
});

// =========================
// EVENT DELEGATION — CARD CLICK
// =========================

document.addEventListener("click", (e) => {
  const card = e.target.closest(".anime-card");

  if (!card) return;

  const id = card.dataset.id;

  if (!id) return;

  window.location.href = `anime-details.html?id=${id}`;
});

// =========================
// API FUNCTIONS
// =========================

const BASE_URL_TOP_MOVIE = "https://api.jikan.moe/v4/top/anime?type=movie";

async function getTopAnimeMovies() {
  try {
    const response = await fetch(BASE_URL_TOP_MOVIE);

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
}

async function getAnime() {
  try {
    const response = await fetch("https://api.jikan.moe/v4/anime");

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
}

async function getAnimeDetails(id) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);

    const data = await response.json();

    return data.data;
  } catch (error) {
    console.error(error);
  }
}

// =========================
// RENDER FUNCTION
// =========================

function renderAnime(list) {
  const grid = document.querySelector(".anime-grid");

  if (!grid) return;

  const fragment = document.createDocumentFragment();

  list.forEach((anime) => {
    fragment.appendChild(createAnimeCard(anime));
  });

  grid.appendChild(fragment);
}

// =========================
// CREATE ANIME CARD
// =========================

function createAnimeCard(anime) {
  const card = document.createElement("div");

  card.className = "anime-card";

  card.dataset.id = anime.mal_id;

  const imageWrapper = document.createElement("div");

  imageWrapper.className = "card-image-wrapper";

  const img = document.createElement("img");

  img.src = anime.images.jpg.large_image_url;

  img.alt = anime.title;

  img.loading = "lazy";

  const overlay = document.createElement("div");

  overlay.className = "card-overlay";

  const playBtn = document.createElement("button");

  playBtn.className = "play-btn";

  const icon = document.createElement("i");

  icon.className = "fa-solid fa-play";

  playBtn.appendChild(icon);

  overlay.appendChild(playBtn);

  const badge = document.createElement("div");

  badge.className = "episodes-badge";

  badge.textContent = `Ep ${anime.episodes ?? "N/A"}`;

  const cardInfo = document.createElement("div");

  cardInfo.className = "card-info";

  const title = document.createElement("h3");

  title.className = "anime-title";

  title.textContent = anime.title;

  const meta = document.createElement("div");

  meta.className = "anime-meta";

  const year = document.createElement("span");

  year.textContent = anime.year ?? "Unknown";

  const rating = document.createElement("span");

  rating.textContent = `⭐ ${anime.score ?? "N/A"}`;

  meta.append(year, rating);

  cardInfo.append(title, meta);

  imageWrapper.append(img, overlay, badge);

  card.append(imageWrapper, cardInfo);

  return card;
}

// =========================
// LOAD DETAILS PAGE
// =========================

async function loadAnimeDetails() {
  const params = new URLSearchParams(window.location.search);

  const id = params.get("id");

  if (!id) return;

  const anime = await getAnimeDetails(id);

  const container = document.querySelector(".anime-details");

  if (!container) return;

  container.innerHTML = "";

  container.appendChild(createAnimeDetails(anime));
}

// =========================
// CREATE DETAILS UI
// =========================

function createAnimeDetails(anime) {
  const hero = document.createElement("section");
  hero.className = "details-hero";

  const backdrop = document.createElement("img");
  backdrop.src = anime.images.jpg.large_image_url;
  backdrop.className = "details-backdrop";

  const overlay = document.createElement("div");
  overlay.className = "details-overlay";

  const container = document.createElement("div");
  container.className = "details-container";

  const poster = document.createElement("img");
  poster.src = anime.images.jpg.large_image_url;
  poster.alt = anime.title;
  poster.className = "details-poster";
  poster.loading = "lazy";

  const info = document.createElement("div");
  info.className = "details-info";

  const title = document.createElement("h1");
  title.className = "details-title";
  title.textContent = anime.title;

  const metaRow = document.createElement("div");
  metaRow.className = "details-meta-row";

  const rating = document.createElement("span");
  rating.className = "rating";
  rating.innerHTML = `<i class="fa-solid fa-star"></i> ${anime.score ?? "N/A"}`;

  const year = document.createElement("span");
  year.className = "year";
  year.textContent = anime.year ?? "Unknown";

  const episodes = document.createElement("span");
  episodes.className = "episodes";
  episodes.textContent = anime.episodes
    ? `${anime.episodes} Episodes`
    : "? Episodes";

  metaRow.append(rating, year, episodes);

  const tags = document.createElement("div");
  tags.className = "hero-tags";
  tags.style.marginBottom = "1.5rem";

  anime.genres?.forEach((genre) => {
    const badge = document.createElement("span");
    badge.className = "tag genre";
    badge.textContent = genre.name;
    tags.appendChild(badge);
  });

  const synopsis = document.createElement("p");
  synopsis.className = "details-synopsis";
  synopsis.textContent = anime.synopsis || "No description available.";

  const actions = document.createElement("div");
  actions.className = "details-actions";

  const watchBtn = document.createElement("a");
  watchBtn.href = "video-player.html?id=" + anime.mal_id;
  watchBtn.className = "btn btn-primary";
  watchBtn.innerHTML = `<i class="fa-solid fa-play"></i> Watch Episode 1`;

  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-secondary";
  addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add to List`;

  actions.append(watchBtn, addBtn);

  info.append(title, metaRow, tags, synopsis, actions);
  container.append(poster, info);
  hero.append(backdrop, overlay, container);

  return hero;
}

// =========================
// API: GET EPISODES
// =========================

async function getAnimeEpisodes(id) {
  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime/${id}/episodes`,
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
  }
}

// =========================
// LOAD VIDEO PLAYER UI
// =========================

async function loadVideoPlayer() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  const anime = await getAnimeDetails(id);
  const episodes = await getAnimeEpisodes(id);

  const titleEl = document.querySelector(".player-info-title");
  const metaEl = document.querySelector(".player-info-meta");
  const videoWrapper = document.querySelector(".video-wrapper");
  const episodeList = document.querySelector(".episode-list");

  if (!titleEl || !episodeList || !anime) return;

  // 1. Update Player Info Title
  if (episodes && episodes.length > 0) {
    titleEl.textContent = `Episode 1: ${episodes[0].title}`;
  } else {
    titleEl.textContent = anime.title;
  }

  // 2. Update Series Meta
  metaEl.innerHTML = `
    <a href="anime-details.html?id=${anime.mal_id}" style="color: var(--accent-primary); font-weight: 600;">${anime.title}</a> 
    <span style="margin: 0 10px;">•</span> 
    Season 1
    `;

  // 3. Mount Video or Trailer (Trailer since Jikan provides no stream files)
  if (anime.trailer && anime.trailer.embed_url) {
    videoWrapper.innerHTML = `
      <iframe src="${anime.trailer.embed_url}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>
    `;
  } else {
    videoWrapper.innerHTML = `
      <video poster="${anime.images.jpg.large_image_url}" controls>
        <source src="#" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
  }

  // 4. Render Sidebar Episodes List
  episodeList.innerHTML = "";

  if (episodes && episodes.length > 0) {
    episodes.forEach((ep, index) => {
      const li = document.createElement("li");
      li.className = `episode-item ${index === 0 ? "active" : ""}`;

      li.innerHTML = `
        <img src="${anime.images.jpg.image_url}" alt="Ep ${ep.mal_id}" class="episode-thumb">
        <div class="episode-details">
            <h4>${ep.mal_id}. ${ep.title}</h4>
            <p>24 min ${index === 0 ? "• Playing" : ""}</p>
        </div>
      `;

      // Select Episode Interaction
      li.addEventListener("click", () => {
        // Clear active state
        document.querySelectorAll(".episode-item").forEach((item) => {
          item.classList.remove("active");
          const p = item.querySelector("p");
          if (p) p.textContent = "24 min";
        });

        // Apply active state
        li.classList.add("active");
        const p = li.querySelector("p");
        if (p) p.textContent = "24 min • Playing";

        // Change Title to Selected Episode
        titleEl.textContent = `Episode ${ep.mal_id}: ${ep.title}`;

        // Usually you'd load new video URL here!
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      episodeList.appendChild(li);
    });
  } else {
    episodeList.innerHTML =
      "<p style='padding: 1rem; color: var(--text-muted);'>No episodes available.</p>";
  }
}
