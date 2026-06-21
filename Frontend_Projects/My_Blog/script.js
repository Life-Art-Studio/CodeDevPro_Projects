document.addEventListener("DOMContentLoaded", async () => {
  // --- Utils ---
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- Data ---
  const FALLBACK_DATA = {
    author: {
      name: "Alex Sterling",
      role: "Investigative Journalist",
      bio: "Uncovering the human condition in a digital age. Reporting from the frontlines of technology and society.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      social: { twitter: "@alexsterling", email: "hello@alexsterling.com" },
    },
    services: [
      {
        icon: "◈",
        title: "Neural Narrative Design",
        desc: "Compelling storytelling architectures optimized for human engagement.",
      },
      {
        icon: "⚡",
        title: "SEO Algorithms",
        desc: "Search engine optimization strategies that align with heuristic shifts.",
      },
      {
        icon: "❖",
        title: "Technical Decryption",
        desc: "Translating complex whitepapers into accessible, high-impact content.",
      },
      {
        icon: "⧉",
        title: "UX/UI Microcopy",
        desc: "Interface text that guides user behavior with precision.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Data Ingestion",
        desc: "Absorbing client requirements and parameters.",
      },
      {
        step: "02",
        title: "Pattern Recognition",
        desc: "Identifying narrative threads and flow.",
      },
      {
        step: "03",
        title: "Synthesis",
        desc: "Drafting the content core with iterative refinement.",
      },
      {
        step: "04",
        title: "Output Deployment",
        desc: "Final polish and delivery of assets.",
      },
    ],
    testimonials: [
      {
        text: "A.S. decoded our complex product vision for investors.",
        client: "Sarah J.",
        role: "CEO, VectorDynamics",
      },
      {
        text: "Throughput increased by 300%. Undeniable ROI.",
        client: "Marcus R.",
        role: "CMO, NeonGrowth",
      },
      {
        text: "Precision writing. Pure signal.",
        client: "Elena K.",
        role: "Product Lead, CipherSoft",
      },
    ],
    posts: [
      {
        id: "silent-algo",
        title: "The Silent Algorithmic Revolution",
        category: "Tech & Society",
        date: "Oct 24, 2025",
        readTime: "8 min read",
        excerpt:
          "How invisible code is shaping our public discourse and private lives.",
        content:
          '<p class="dropcap">We live in an era where profound changes happen silently.</p>',
        image:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "digital-declutter",
        title: "The Art of Digital Decluttering",
        category: "Minimalism",
        date: "Sep 12, 2025",
        readTime: "5 min read",
        excerpt: "Why less is more in an age of infinite scrolling.",
        content:
          "<p>In a world designed to capture attention, looking away is radical.</p>",
        image:
          "https://images.unsplash.com/photo-1499244571941-233d3ece669b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "print-journalism",
        title: "Why Print Journalism Will Never Die",
        category: "Opinion",
        date: "Aug 30, 2025",
        readTime: "6 min read",
        excerpt: "Permanence in an era of pixels.",
        content: "<p>They predicted the death of print. They were wrong.</p>",
        image:
          "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "future-ai-writing",
        title: "Review: The Future of AI Writing Tools",
        category: "Tech",
        date: "Oct 15, 2025",
        readTime: "4 min read",
        excerpt: "A deep dive into LLM capabilities.",
        content: "<p>Are they partners or replacements?</p>",
        image:
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      },
    ],
  };

  let blogData = {};
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("Status code " + response.status);
    blogData = await response.json();
  } catch (e) {
    // console.warn("Using embedded fallback data");
    blogData = FALLBACK_DATA;
  }

  // --- Init ---
  const path = window.location.pathname;
  const isPostPage = path.includes("post.html");
  const isAboutPage = path.includes("about.html");
  const isHomePage =
    (!isPostPage && !isAboutPage) ||
    path.endsWith("index.html") ||
    path === "/";

  // Theme Check
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.setAttribute("data-theme", savedTheme);

  // Loader
  await wait(800);
  document.body.classList.remove("loading");
  const loader = document.getElementById("loader");
  if (loader) loader.style.opacity = "0";
  setTimeout(() => {
    if (loader) loader.remove();
  }, 500);

  // --- Render ---
  if (isHomePage) {
    renderHero(blogData.author);
    renderServices(blogData.services);
    renderProcess(blogData.process);
    renderTestimonials(blogData.testimonials);
    renderPostsGrid(blogData.posts);
  } else if (isPostPage) {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    const post = blogData.posts.find((p) => p.id === postId);
    if (post) renderSinglePost(post);
    else
      document.getElementById("post-header").innerHTML =
        `<h1>ERROR 404: DATA NOT FOUND</h1>`;
  }

  // --- Interaction ---
  setupCursor();
  setupMobileMenu();
  setupScrollReveal();
  setupLogin();
  setupThemeToggle(); // New Theme Logic

  // --- Functions ---
  function renderHero(author) {
    const heroContainer = document.getElementById("hero-content");
    if (!heroContainer || !author) return;
    heroContainer.innerHTML = `
            <span class="eyebrow glitch" data-text="SYSTEM_READY">SYSTEM_READY</span>
            <h1 class="hero-title">
                <span class="block-reveal" style="--delay:0.1s">UNCOVERING</span><br>
                <span class="block-reveal highlight" style="--delay:0.3s">THE_DIGITAL_TRUTH</span>
            </h1>
            <p class="hero-lead fade-in-up" style="--delay:0.5s">${author.bio}</p>
            <div class="hero-actions fade-in-up" style="--delay:0.7s">
                <a href="#featured" class="btn primary hacker-btn"><span class="btn-text">INITIATE_READ</span></a>
                <button id="login-trigger" class="btn secondary" style="margin-left:20px; font-family:var(--font-mono); border:1px solid var(--text-muted); background:transparent; color:var(--text-muted); padding:15px 30px;">ACCESS_ADMIN</button>
            </div>
        `;
  }

  // ... (Other render functions kept same as previous step, just reusing logic for brevity if implied, but I will include them to be safe)
  function renderServices(services) {
    const container = document.getElementById("services-grid");
    if (!container) return;
    container.innerHTML = services
      .map(
        (s, i) => `
            <div class="service-card fade-in-up" style="--delay:${i * 0.1}s">
                <div class="service-icon">${s.icon}</div><h3>${s.title}</h3><p>${s.desc}</p>
            </div>`,
      )
      .join("");
  }
  function renderProcess(process) {
    const container = document.getElementById("process-timeline");
    if (!container) return;
    container.innerHTML = process
      .map(
        (p, i) => `
            <div class="process-step fade-in-up" style="--delay:${i * 0.2}s">
                <div class="step-number">${p.step}</div><h3>${p.title}</h3><p>${p.desc}</p>
            </div>`,
      )
      .join("");
  }
  function renderTestimonials(testimonials) {
    const container = document.getElementById("testimonials-grid");
    if (!container) return;
    container.innerHTML = testimonials
      .map(
        (t, i) => `
            <div class="testimonial-card fade-in-up" style="--delay:${i * 0.15}s">
                <p class="testimonial-text">"${t.text}"</p><div class="client-info"><span class="client-name">${t.client}</span> // <span class="client-role">${t.role}</span></div>
            </div>`,
      )
      .join("");
  }
  function renderPostsGrid(posts) {
    const grid = document.getElementById("posts-grid");
    if (!grid) return;
    grid.innerHTML = posts
      .map(
        (post, index) => `
            <article class="card futuristic-card fade-in-up" style="--delay:${index * 0.1 + 0.2}s">
                <div class="card-image-wrapper"><img src="${post.image}" alt="${post.title}" class="card-img" onerror="this.style.display='none'"><div class="overlay"></div></div>
                <div class="card-content">
                    <div class="card-meta"><span class="tag">TOPIC :: ${post.category.toUpperCase()}</span><span class="date">${post.date}</span></div>
                    <h3 class="card-title"><a href="post.html?id=${post.id}">${post.title}</a></h3>
                    <p class="excerpt">${post.excerpt}</p>
                    <a href="post.html?id=${post.id}" class="read-link">ACCESS_FILE >></a>
                </div>
            </article>`,
      )
      .join("");
  }
  function renderSinglePost(post) {
    document.title = `${post.title} | Alex Sterling`;
    document.getElementById("post-header").innerHTML =
      `<div class="meta-row"><span class="terminal-text">>> ID: ${post.id.toUpperCase()}</span><span class="terminal-text">>> DATE: ${post.date}</span></div><h1 class="glitch-header" data-text="${post.title}">${post.title}</h1><div class="meta-row"><span class="tag">CATEGORY: ${post.category}</span><span class="read-time">EST_TIME: ${post.readTime}</span></div>`;
    document.getElementById("post-image").innerHTML =
      `<img src="${post.image}" alt="${post.title}" class="hero-img">`;
    document.getElementById("post-content").innerHTML = post.content;
  }

  function setupCursor() {
    const dot = document.querySelector(".cursor-dot");
    const outline = document.querySelector(".cursor-outline");
    window.addEventListener("mousemove", (e) => {
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      outline.animate(
        { left: `${e.clientX}px`, top: `${e.clientY}px` },
        { duration: 500, fill: "forwards" },
      );
    });
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => outline.classList.add("hover"));
      el.addEventListener("mouseleave", () =>
        outline.classList.remove("hover"),
      );
    });
  }

  function setupMobileMenu() {
    const btn = document.querySelector(".mobile-menu-btn");
    const nav = document.querySelector(".main-nav");
    if (btn) {
      btn.addEventListener("click", () => {
        nav.classList.toggle("active");
        btn.classList.toggle("active");
      });
    }
  }

  function setupScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 },
    );
    document
      .querySelectorAll(".fade-in-up")
      .forEach((el) => observer.observe(el));
  }

  function setupLogin() {
    document.addEventListener("click", (e) => {
      if (e.target.closest("#login-trigger")) {
        const password = prompt("ENTER ACCESS CREDENTIALS:");
        if (password === "admin") {
          alert("ACCESS GRANTED. WELCOME ALEX.");
          e.target.innerText = "ADMIN_ACTIVE";
          document.querySelectorAll(".card").forEach((card) => {
            const editBtn = document.createElement("div");
            editBtn.innerText = "[EDIT_POST]";
            editBtn.style.color = "var(--primary)";
            editBtn.style.fontFamily = "var(--font-mono)";
            editBtn.style.marginTop = "10px";
            card.querySelector(".card-content").appendChild(editBtn);
          });
        } else {
          alert("ACCESS DENIED.");
        }
      }
    });
  }

  function setupThemeToggle() {
    // Since we are reinjecting HTML, we prefer event delegation or checking if btn exists (it's hardcoded in HTML files now)
    const toggleBtn = document.querySelector(".theme-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        document.body.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
      });
    }
  }
});
