/**
 * CodeDevPro Portfolio - Interactive Logic
 * Handles custom cursor, preloader, dynamic project rendering and search
 */

const initApp = () => {
  // --- 1. Preloader ---
  const preloader = document.getElementById("preloader");
  setTimeout(() => {
    preloader.classList.add("fade-out");
    setTimeout(() => {
      preloader.style.display = "none";
    }, 800);
  }, 1500); // Simulate loading time

  // --- 2. Custom Cursor ---
  const cursorDot = document.getElementById("cursor-dot");
  const cursorOutline = document.getElementById("cursor-outline");
  let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {
    window.addEventListener("mousemove", (e) => {
      const posX = e.clientX;
      const posY = e.clientY;

      // Dot follows exactly
      cursorDot.style.left = `${posX}px`;
      cursorDot.style.top = `${posY}px`;

      // Outline follows with slight delay using requestAnimationFrame
      cursorOutline.animate(
        {
          left: `${posX}px`,
          top: `${posY}px`,
        },
        { duration: 500, fill: "forwards" },
      );
    });

    // Hover effects for magnetic elements
    const hoverElements = document.querySelectorAll(
      "a, button, .magnetic, input, .project-card",
    );
    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", () =>
        cursorOutline.classList.add("hover"),
      );
      el.addEventListener("mouseleave", () =>
        cursorOutline.classList.remove("hover"),
      );
    });
  } else {
    // Fallback for touch devices
    document.body.style.cursor = "auto";
  }

  // --- 3. Dynamic Project Data ---
  // Extracted from the provided directory structure
  const projectsData = [
    {
      title: "Advanced Weather App",
      folder: "Advanced Weather",
      desc: "A highly detailed weather forecasting application with advanced metrics and interactive maps.",
      icon: "fa-cloud-sun-rain",
      tags: ["API", "Data Viz"],
    },
    {
      title: "Expense Tracker Pro",
      folder: "Expense Tracker",
      desc: "Track finances smartly with graphical insights, earnings vs expenses comparison.",
      icon: "fa-wallet",
      tags: ["Finance", "Local Storage"],
    },
    {
      title: "My Blog Engine",
      folder: "My_Blog",
      desc: "A personal blogging platform with futuristic dark and light mode themes.",
      icon: "fa-blog",
      tags: ["CMS", "Theming"],
    },
    {
      title: "Meme Generator",
      folder: "Project_10_Meme_Generator",
      desc: "Instantly create and download hilarious memes using an external meme API.",
      icon: "fa-masks-theater",
      tags: ["Fun", "API", "Canvas"],
    },
    {
      title: "Dynamic Progress Bar",
      folder: "Project_11_Progress_Bar",
      desc: "Interactive multi-step progress bar component for complex forms or wizards.",
      icon: "fa-bars-progress",
      tags: ["UI/UX", "Component"],
    },
    {
      title: "Spotify Clone UI",
      folder: "Project_12_Spotify_clone",
      desc: "A stunning audio player mimicking the famous Spotify interface and functionality.",
      icon: "fa-spotify",
      tags: ["Audio", "Clone"],
    },
    {
      title: "AI Image Generator",
      folder: "Project_13_AI_Image_Generator",
      desc: "Leveraging Eden AI API to generate stunning images directly from text prompts.",
      icon: "fa-robot",
      tags: ["AI", "API"],
    },
    {
      title: "Secure PW Generator",
      folder: "Project_3_Random PW_Generator",
      desc: "Generate cryptographically secure passwords with custom strength settings.",
      icon: "fa-lock",
      tags: ["Utility", "Security"],
    },
    {
      title: "Interactive Counter",
      folder: "Project_4_Counter",
      desc: "A sleek, responsive counter component showcasing state management.",
      icon: "fa-stopwatch",
      tags: ["State", "UI"],
    },
    {
      title: "Guess The Number",
      folder: "Project_5_Guess_the_number",
      desc: "A classic interactive logic game to test user deductive reasoning.",
      icon: "fa-dice",
      tags: ["Game", "Logic"],
    },
    {
      title: "String Transformer",
      folder: "Project_5_String_Transformer",
      desc: "Utility to instantly transform text into Camel, Kebab, Snake, and Pascal cases.",
      icon: "fa-font",
      tags: ["Utility", "Text"],
    },
    {
      title: "Tele Formatter",
      folder: "Project_6_Tele_Formatter",
      desc: "Auto-formatting input field for international phone numbers.",
      icon: "fa-phone",
      tags: ["Forms", "UX"],
    },
    {
      title: "Toast Snackbar",
      folder: "Project_7_ToastSnackbar",
      desc: "Reusable, elegant pop-up notification system for modern web apps.",
      icon: "fa-message",
      tags: ["UI", "Notifications"],
    },
    {
      title: "Auto Typing Effect",
      folder: "Project_8_Auto_typing",
      desc: "Cinematic text typing animation component for hero sections.",
      icon: "fa-keyboard",
      tags: ["Animation", "Hero"],
    },
    {
      title: "Bill Splitter",
      folder: "Project_9_Bill_splitter",
      desc: "Easily split restaurant bills including custom tip percentages and tax.",
      icon: "fa-file-invoice-dollar",
      tags: ["Math", "Utility"],
    },
    {
      title: "Basic Weather",
      folder: "Projects_1_Weather",
      desc: "A clean, minimalist weather widget utilizing the OpenWeather API.",
      icon: "fa-cloud",
      tags: ["API", "Widget"],
    },
    {
      title: "ToDo List App",
      folder: "Projecy_2_ToDo_List",
      desc: "A robust task management application to plan your day efficiently.",
      icon: "fa-list-check",
      tags: ["CRUD", "Productivity"],
    },
    {
      title: "Advanced Sub-Project 1",
      folder: "Advanced Projects/Project_1",
      desc: "A sophisticated exploration into deeper frontend architectural patterns.",
      icon: "fa-layer-group",
      tags: ["Architecture", "Advanced"],
    },
    {
      title: "Advanced Sub-Project 2",
      folder: "Advanced Projects/Project_2",
      desc: "A high-end experimental project focusing on intricate UI animations.",
      icon: "fa-wand-magic-sparkles",
      tags: ["Animation", "Advanced"],
    },
    {
      title: "Practice Mastery",
      folder: "Practice_Mastery",
      desc: "A repository of targeted coding drills and algorithm practice exercises.",
      icon: "fa-dumbbell",
      tags: ["Learning", "Drills"],
    },
    {
      title: "Calculator",
      folder: "Calculator",
      desc: "A simple calculator to perform basic arithmetic operations.",
      icon: "fa-calculator",
      tags: ["Math", "Utility"],
    },
  ];

  // --- 4. Render Projects ---
  const grid = document.getElementById("projects-grid");
  const searchInput = document.getElementById("search-input");

  const renderProjects = (projectsToRender) => {
    grid.innerHTML = "";

    if (projectsToRender.length === 0) {
      grid.innerHTML =
        '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No projects found matching your search.</div>';
      return;
    }

    projectsToRender.forEach((proj, index) => {
      // Reusable logic to add stagger animation
      const delay = index * 0.1;

      const card = document.createElement("div");
      card.className = "project-card";
      card.style.animation = `fadeUp 0.6s ease ${delay}s backwards`;

      // Build Tags HTML
      const tagsHtml = proj.tags
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join("");

      // Build URI - Handling spaces in URL properly
      const folderURI = encodeURIComponent(proj.folder).replace(/%2f/gi, "/");
      const linkPath = `./Frontend Projects/${folderURI}/index.html`;

      card.innerHTML = `
                <div class="card-icon">
                    <i class="fa-solid ${proj.icon}"></i>
                </div>
                <h3 class="card-title">${proj.title}</h3>
                <div class="card-tags">
                    ${tagsHtml}
                </div>
                <p class="card-desc">${proj.desc}</p>
                <a href="${linkPath}" target="_blank" class="card-link magnetic">
                    Launch Application <i class="fa-solid fa-arrow-right"></i>
                </a>
            `;
      grid.appendChild(card);
    });

    // Re-attach hover listener for magnetic items inside new cards
    if (!isTouchDevice) {
      document.querySelectorAll(".card-link, .project-card").forEach((el) => {
        el.addEventListener("mouseenter", () =>
          cursorOutline.classList.add("hover"),
        );
        el.addEventListener("mouseleave", () =>
          cursorOutline.classList.remove("hover"),
        );
      });
    }
  };

  // Inject fadeUp keyframe dynamically
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
        @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(30px) perspective(1000px); }
            100% { opacity: 1; transform: translateY(0) perspective(1000px); }
        }
    `;
  document.head.appendChild(styleSheet);

  // Initial render
  renderProjects(projectsData);

  // --- 5. Search Functionality ---
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = projectsData.filter(
      (proj) =>
        proj.title.toLowerCase().includes(query) ||
        proj.desc.toLowerCase().includes(query) ||
        proj.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
    renderProjects(filtered);
  });

  // Header scroll effect
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".glass-header");
    if (window.scrollY > 50) {
      header.style.background = "rgba(11, 15, 25, 0.85)";
      header.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.5)";
    } else {
      header.style.background = "rgba(11, 15, 25, 0.6)";
      header.style.boxShadow = "none";
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
