/* ============================================================
   main.js — Core site logic
   Particles, typewriter, data loading, theme, navigation
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initTypewriter();
  initThemeToggle();
  initNavbar();
  initMobileMenu();
  initBackToTop();
  initScrollIndicator();
  loadPortfolio();
  animateStats();
  setYear();
  initProjectInteractions();
  initLazyObserver();
  initSectionReveal();
  initCardTilt();
  AOS.init({ once: true, duration: 800, easing: "ease-out-cubic" });
});

/* ─────────────────────────────────────────────
   PARTICLES
   ───────────────────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  const count = 50;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(107, 174, 214, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < count; i++) particles.push(new Particle());

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(107, 174, 214, ${0.08 * (1 - dist / 140)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    connectParticles();
    requestAnimationFrame(animate);
  }
  animate();
}

/* ─────────────────────────────────────────────
   TYPEWRITER
   ───────────────────────────────────────────── */
function initTypewriter() {
  const el = document.getElementById("typewriter");
  if (!el) return;
  const phrases = [
    "beautiful interfaces.",
    "robust backends.",
    "responsive web apps.",
    "seamless experiences.",
    "modern solutions.",
  ];
  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pauseEnd = 0;

  function tick() {
    const now = Date.now();
    if (now < pauseEnd) {
      requestAnimationFrame(tick);
      return;
    }

    const current = phrases[phraseIdx];
    if (!deleting) {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        pauseEnd = now + 2000;
      }
    } else {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }
    const speed = deleting ? 35 : 70;
    setTimeout(() => requestAnimationFrame(tick), speed);
  }
  tick();
}

/* ─────────────────────────────────────────────
   THEME TOGGLE
   ───────────────────────────────────────────── */
function initThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  const icon = document.getElementById("theme-icon");
  const html = document.documentElement;

  const saved = localStorage.getItem("theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  let isDark = saved === "dark" || (!saved && prefersDark);

  function applyTheme() {
    if (isDark) {
      html.classList.add("dark-mode");
      html.classList.remove("light-mode");
      if (icon) {
        icon.classList.remove("ph-sun");
        icon.classList.add("ph-moon");
      }
    } else {
      html.classList.add("light-mode");
      html.classList.remove("dark-mode");
      if (icon) {
        icon.classList.remove("ph-moon");
        icon.classList.add("ph-sun");
      }
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  // Apply on load
  applyTheme();

  toggle.addEventListener("click", () => {
    isDark = !isDark;
    applyTheme();
  });
}

/* ─────────────────────────────────────────────
   NAVBAR
   ───────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const links = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section");

  // Update navbar style and active link on scroll
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
    let current = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id || "hero";
    });
    links.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + current,
      );
    });
  });

  // Click listener for lazy-loading sections
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const sectionEl = document.getElementById(targetId);
      if (sectionEl && sectionEl.dataset.loaded !== "true") {
        loadSection(targetId);
      }
      // Smooth scroll to the section
      document.getElementById(targetId).scrollIntoView({ behavior: "smooth" });
    });
  });
}

function loadSection(id) {
  const url = `sections/${id}.html`;
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.text();
    })
    .then((html) => {
      const section = document.getElementById(id);
      if (!section) return;
      section.innerHTML = html;
      section.dataset.loaded = "true";
      // Remove the loading spinner pseudo-element class
      section.style.display = "";
      // Refresh AOS animations for newly added content
      if (window.AOS) AOS.refresh();

      if (id === "projects") {
        initProjectsSwiper();
      }
    })
    .catch((err) => console.warn("Failed to load section", id, err));
}

function initProjectsSwiper() {
  if (typeof Swiper !== "undefined") {
    new Swiper(".projects-swiper", {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      speed: 800, // Smooth transition
      coverflowEffect: {
        rotate: 10, // Subtle 3D rotation like a poster
        stretch: 0,
        depth: 150, // Slight push back for side cards
        modifier: 1,
        slideShadows: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        dynamicBullets: true,
      },
      keyboard: {
        enabled: true,
      },
      mousewheel: {
        forceToAxis: true, // Allow scrolling horizontally with trackpad/mousewheel
      },
      observer: true,
      observeParents: true,
      slideToClickedSlide: true, // Allow clicking side cards to center them
      initialSlide: 1,
      spaceBetween: 0,
    });
  }
}

/* ─────────────────────────────────────────────
   LAZY OBSERVER — auto-load sections on scroll
   ───────────────────────────────────────────── */
function initLazyObserver() {
  const lazyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target;
        const id = section.id;
        if (section.dataset.loaded === "false" && id) {
          loadSection(id);
          lazyObserver.unobserve(section);
        }
      });
    },
    { rootMargin: "200px 0px", threshold: 0 },
  );

  document.querySelectorAll('section[data-loaded="false"]').forEach((sec) => {
    lazyObserver.observe(sec);
  });
}

function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const links = document.getElementById("nav-links");

  btn.addEventListener("click", () => {
    links.classList.toggle("open");
  });

  // Close on link click
  links.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => links.classList.remove("open"));
  });
}

/* ─────────────────────────────────────────────
   BACK TO TOP
   ───────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 500);
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ─────────────────────────────────────────────
   SCROLL INDICATOR
   ───────────────────────────────────────────── */
function initScrollIndicator() {
  const el = document.getElementById("scroll-indicator");
  if (!el) return;
  el.addEventListener("click", () => {
    const about = document.getElementById("about");
    if (about) about.scrollIntoView({ behavior: "smooth" });
  });
  window.addEventListener("scroll", () => {
    el.style.opacity = window.scrollY > 200 ? "0" : "1";
  });
}

/* ─────────────────────────────────────────────
   LOAD DATA
   ───────────────────────────────────────────── */
async function loadPortfolio() {
  try {
    const res = await fetch("assets/data/portfolio.json");
    const data = await res.json();
    // renderProjects(data.projects); // Disabled to prevent overwriting the hardcoded rich project cards in projects.html
    renderExperience(data.experience);
    renderCertifications(data.certifications);
  } catch (err) {
    console.warn("Could not load portfolio.json:", err);
  }
}

function renderProjects(projects) {
  const container = document.getElementById("projects-container");
  if (!container) return;
  container.innerHTML = projects
    .map(
      (p, i) => `
    <article class="project-card" data-aos="fade-up" data-aos-delay="${i * 100}">
      <div class="project-card-image">
        <img src="${p.image}" alt="${p.title}" />
        <div class="overlay">
          <a href="${p.url}" target="_blank" rel="noopener" class="btn-view">
            <i class="ph ph-arrow-square-out"></i> View Project
          </a>
        </div>
      </div>
      <div class="project-card-body">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="project-tags">
          ${(p.tags || []).map((t) => `<span>${t}</span>`).join("")}
        </div>
      </div>
    </article>
  `,
    )
    .join("");
}

function renderExperience(experience) {
  const timeline = document.getElementById("experience-timeline");
  if (!timeline) return;
  timeline.innerHTML = experience
    .map(
      (e, i) => `
    <div class="timeline-item" data-aos="fade-up" data-aos-delay="${i * 150}">
      <h4>${e.role}</h4>
      <div class="company">${e.company}</div>
      <span class="period"><i class="ph ph-calendar-blank"></i> ${e.period}</span>
      <p>${e.details}</p>
    </div>
  `,
    )
    .join("");
}

function renderCertifications(certifications) {
  const container = document.getElementById("certifications-container");
  if (!container || !certifications) return;
  container.innerHTML = certifications
    .map(
      (c, i) => `
    <div class="certification-card animated-list-item">
      <div class="cert-icon">
        <i class="ph ph-medal"></i>
      </div>
      <div class="cert-info">
        <span class="cert-issuer">${c.issuer}</span>
        <h4 class="cert-title">${c.title}</h4>
      </div>
    </div>
  `,
    )
    .join("");

  // Intersection Observer for ReactBits-style Animated List
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        const items = container.querySelectorAll(".animated-list-item");
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add("show");
          }, index * 80); // Stagger delay for each item
        });
        observer.disconnect();
      }
    },
    { threshold: 0.1 },
  );

  observer.observe(container);
}

/* ─────────────────────────────────────────────
   STATS COUNTER
   ───────────────────────────────────────────── */
function animateStats() {
  const targets = {
    "stat-projects": 5,
    "stat-experience": 1,
    "stat-clients": 16,
  };
  const duration = 2000;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = targets[el.id];
        if (!end) return;
        let start = 0;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          el.textContent = Math.floor(progress * end) + "+";
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 },
  );

  Object.keys(targets).forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

/* ─────────────────────────────────────────────
   YEAR
   ───────────────────────────────────────────── */
function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────────
   PROJECT CARD — LIGHTBOX & TABS
   Uses event delegation so it works even when
   sections are loaded dynamically via fetch.
   ───────────────────────────────────────────── */

/* Gallery data: add new projects here */
const galleries = {
  sportspace: [
    "assets/images/project/ss1.png",
    "assets/images/project/ss2.png",
    "assets/images/project/ss3.png",
    "assets/images/project/ss4.png",
    "assets/images/project/ss5.png",
    "assets/images/project/ss6.png",
    "assets/images/project/ss7.png",
  ],
  pilgrimageapps: [
    "assets/images/project/uh1.png",
    "assets/images/project/uh2.png",
    "assets/images/project/uh3.png",
    "assets/images/project/uh4.png",
    "assets/images/project/uh5.png",
    "assets/images/project/uh6.png",
    "assets/images/project/uh7.png",
  ],
  lensakulitku: [
    "assets/images/project/LS (1).png",
    "assets/images/project/LS (2).png",
    "assets/images/project/LS (3).png",
    "assets/images/project/LS (4).png",
  ],
  sedia: [
    "assets/images/project/sd (1).png",
    "assets/images/project/sd (2).png",
    "assets/images/project/sd (3).png",
    "assets/images/project/sd (4).png",
    "assets/images/project/sd (5).png",
    "assets/images/project/sd (6).png",
    "assets/images/project/sd (7).png",
    "assets/images/project/sd (8).png",
    "assets/images/project/sd (9).png",
  ],
  umrohpredict: [
    "assets/images/project/pr (1).png",
    "assets/images/project/pr (2).png",
    "assets/images/project/pr (3).png",
    "assets/images/project/pr (4).png",
    "assets/images/project/pr (5).png",
    "assets/images/project/pr (6).png",
    "assets/images/project/pr (7).png",
  ],
};

let _lightboxGallery = null;
let _lightboxIdx = 0;

function openLightbox(key, idx) {
  _lightboxGallery = key;
  _lightboxIdx = idx;
  _renderLightbox();
  document.getElementById("lightbox-overlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function _closeLightbox() {
  document.getElementById("lightbox-overlay").classList.remove("active");
  document.body.style.overflow = "";
}

function _shiftLightbox(dir) {
  if (!_lightboxGallery) return;
  const imgs = galleries[_lightboxGallery];
  _lightboxIdx = (_lightboxIdx + dir + imgs.length) % imgs.length;
  _renderLightbox();
}

function _renderLightbox() {
  const imgs = galleries[_lightboxGallery];
  const img = document.getElementById("lightbox-img");
  img.style.opacity = 0;
  setTimeout(() => {
    img.src = imgs[_lightboxIdx];
    img.style.opacity = 1;
  }, 120);
  document.getElementById("lightbox-counter").textContent =
    _lightboxIdx + 1 + " / " + imgs.length;
}

function initProjectInteractions() {
  const overlay = document.getElementById("lightbox-overlay");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  /* Close button */
  closeBtn && closeBtn.addEventListener("click", _closeLightbox);

  /* Prev / Next */
  prevBtn && prevBtn.addEventListener("click", () => _shiftLightbox(-1));
  nextBtn && nextBtn.addEventListener("click", () => _shiftLightbox(1));

  /* Click on backdrop to close */
  overlay &&
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) _closeLightbox();
    });

  /* Keyboard shortcuts */
  document.addEventListener("keydown", (e) => {
    if (!overlay || !overlay.classList.contains("active")) return;
    if (e.key === "Escape") _closeLightbox();
    if (e.key === "ArrowRight") _shiftLightbox(1);
    if (e.key === "ArrowLeft") _shiftLightbox(-1);
  });

  /* ── Event delegation for dynamically loaded cards ── */
  document.body.addEventListener("click", (e) => {
    /* Zoom / image click → open lightbox */
    const zoomBtn = e.target.closest("[data-lightbox-key]");
    if (zoomBtn) {
      openLightbox(
        zoomBtn.dataset.lightboxKey,
        parseInt(zoomBtn.dataset.lightboxIdx || 0),
      );
      return;
    }

    /* Tab click → switch panel */
    const tab = e.target.closest("[data-tab-target]");
    if (tab) {
      const card = tab.closest(".pcard-body");
      if (!card) return;
      card
        .querySelectorAll(".pcard-tab")
        .forEach((t) => t.classList.remove("active"));
      card
        .querySelectorAll(".pcard-panel")
        .forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = document.getElementById(tab.dataset.tabTarget);
      if (panel) panel.classList.add("active");
    }
  });
}

/* ─────────────────────────────────────────────
   SECTION REVEAL — Smooth fade-in on scroll
   ───────────────────────────────────────────── */
function initSectionReveal() {
  const sections = document.querySelectorAll(".section");
  // Make the hero always visible
  const hero = document.getElementById("hero");
  if (hero) hero.style.opacity = "1";

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -50px 0px" },
  );

  sections.forEach((sec) => revealObserver.observe(sec));
}

/* ─────────────────────────────────────────────
   CARD TILT — Subtle 3D tilt on mouse move
   ───────────────────────────────────────────── */
function initCardTilt() {
  // Use event delegation for dynamically loaded cards
  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".ecard");
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle rotation (max ±3 degrees)
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });

  document.addEventListener(
    "mouseleave",
    (e) => {
      const card = e.target.closest(".ecard");
      if (!card) return;
      card.style.transform = "";
    },
    true,
  );

  // Reset on mouseout from ecard
  document.addEventListener("mouseout", (e) => {
    const card = e.target.closest(".ecard");
    if (card && !card.contains(e.relatedTarget)) {
      card.style.transform = "";
    }
  });
}
