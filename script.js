/* deleFOCO Casting y Talento — script */
document.body.classList.remove("theme-light");
document.body.classList.add("mode-b2b", "theme-dark");

const state = { lang: "es", statusKey: null };

const copy = {
  es: { pageTitle: "Casting y Talento para Producciones | deleFOCO", pageDesc: "Casting y talento en Costa Rica y Centroamérica: actores, modelos, extras, bailarines, músicos y presentadores.", toTop: "Volver arriba", themeDark: "Oscuro", themeLight: "Claro", errors: "Complete los campos obligatorios antes de enviar.", ok: "Solicitud lista. Se abrió WhatsApp en una nueva pestaña.", blocked: "El navegador bloqueó WhatsApp. Permita las ventanas emergentes e intente de nuevo.", count: "perfiles", hi: "Hola, quiero solicitar un casting con deleFOCO:", pub: "Hola, quiero publicar un casting en Oportunidades:", wa: "Hola, quiero cotizar un casting con deleFOCO.", briefNote: "enlace del brief" },
  en: { pageTitle: "Casting & Talent for Productions | deleFOCO", pageDesc: "Casting and talent in Costa Rica and Central America: actors, models, extras, dancers, musicians and hosts for local and international productions.", toTop: "Back to top", themeDark: "Dark", themeLight: "Light", errors: "Please complete the required fields before sending.", ok: "Request ready. WhatsApp was opened in a new tab.", blocked: "Your browser blocked WhatsApp. Allow pop-ups and try again.", count: "profiles", hi: "Hi, I want to request a casting with deleFOCO:", pub: "Hi, I want to post a casting in Opportunities:", wa: "Hi, I want a quote for a casting with deleFOCO.", briefNote: "brief link" }
};

function setText(id, value, html = false) {
  const el = document.getElementById(id);
  if (!el) return;
  html ? (el.innerHTML = value) : (el.textContent = value);
}

const colorToggle = document.getElementById("colorToggle");

function updateThemeToggle() {
  if (!colorToggle) return;
  const isDark = document.body.classList.contains("theme-dark");
  const text = colorToggle.querySelector(".color-toggle-text");
  const icon = colorToggle.querySelector(".color-toggle-icon");
  const label = isDark ? copy[state.lang].themeLight : copy[state.lang].themeDark;
  if (text) text.textContent = label;
  if (icon) icon.textContent = isDark ? "☀" : "☾";
  colorToggle.setAttribute("aria-label", label);
  colorToggle.setAttribute("title", label);
  colorToggle.setAttribute("aria-pressed", String(isDark));
}

colorToggle?.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("theme-dark");
  document.body.classList.toggle("theme-light", !isDark);
  updateThemeToggle();
});

function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll(".lang-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.lang === state.lang)
  );
  const c = copy[state.lang];
  // Textos con data-en: alterna entre español (original) e inglés
  document.querySelectorAll("[data-en]").forEach((el) => {
    if (!("es" in el.dataset)) el.dataset.es = el.tagName === "OPTION" ? el.textContent : el.innerHTML;
    const value = state.lang === "en" ? el.dataset.en : el.dataset.es;
    if (el.tagName === "OPTION") el.textContent = value;
    else el.innerHTML = value;
  });
  // Atributos traducibles: data-en-placeholder, data-en-aria-label, data-en-aria-roledescription
  ["placeholder", "aria-label", "aria-roledescription"].forEach((attr) => {
    document.querySelectorAll("[data-en-" + attr + "]").forEach((el) => {
      const esKey = "data-es-" + attr;
      if (!el.hasAttribute(esKey)) el.setAttribute(esKey, el.getAttribute(attr) || "");
      el.setAttribute(
        attr,
        state.lang === "en" ? el.getAttribute("data-en-" + attr) : el.getAttribute(esKey)
      );
    });
  });
  // Título de la pestaña y meta descripción
  document.title = c.pageTitle;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", c.pageDesc);
  // Botón "volver arriba" (se crea más abajo)
  const toTopBtn = document.querySelector(".to-top");
  if (toTopBtn) toTopBtn.setAttribute("aria-label", c.toTop);
  updateThemeToggle();
  window.dispatchEvent(new Event("langchange"));
}

document.querySelectorAll(".lang-btn").forEach((btn) =>
  btn.addEventListener("click", () => {
    state.lang = btn.dataset.lang;
    applyLanguage();
  })
);


const WA = "https://wa.me/50686823430?text=";
const lab = (el) => el.closest("label").querySelector("span").textContent.trim();
function compose(form, title) {
  const lines = [title, ""], seen = new Set();
  form.querySelectorAll("[name]").forEach((el) => {
    if (el.name === "consent" || el.type === "hidden") return;
    if (el.type === "checkbox") {
      if (seen.has(el.name)) return; seen.add(el.name);
      const v = [...form.querySelectorAll('[name="' + el.name + '"]:checked')].map((c) => c.closest("label").textContent.trim()).join(", ");
      if (v) lines.push(el.closest("fieldset").querySelector("legend").textContent + ": " + v);
      return;
    }
    const v = el.value.trim(); if (v) lines.push(lab(el) + ": " + v);
  });
  return lines.join("\n");
}
function sendWA(text, statusEl) {
  const w = window.open(WA + encodeURIComponent(text), "_blank", "noopener,noreferrer");
  state.statusKey = w ? "ok" : "blocked";
  statusEl.dataset.key = state.statusKey; statusEl.textContent = copy[state.lang][state.statusKey];
}
window.addEventListener("langchange", () => {
  document.querySelectorAll(".form-status[data-key]").forEach((s) => (s.textContent = copy[state.lang][s.dataset.key]));
  updateCount();
});

/* Solicitar casting */
document.getElementById("leadForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target, st = document.getElementById("reqStatus");
  if (!f.checkValidity()) { st.dataset.key = "errors"; st.textContent = copy[state.lang].errors; f.reportValidity(); return; }
  sendWA(compose(f, copy[state.lang].hi), st);
});

/* Publicar casting (wizard) */
(function () {
  const f = document.getElementById("pubForm"); if (!f) return;
  const panels = [...f.querySelectorAll(".wiz-panel")], dots = [...f.querySelectorAll(".wiz-dot")];
  const prev = document.getElementById("wizPrev"), next = document.getElementById("wizNext"), st = document.getElementById("pubStatus");
  let i = 0;
  function show(n) {
    i = n;
    panels.forEach((p, k) => p.classList.toggle("active", k === i));
    dots.forEach((d, k) => d.classList.toggle("active", k <= i));
    prev.style.visibility = i === 0 ? "hidden" : "visible";
    const last = i === panels.length - 1;
    next.querySelector("[data-en]") && 0;
    next.firstChild.textContent = last ? (state.lang === "en" ? "Publish" : "Publicar") : (state.lang === "en" ? "Next" : "Siguiente");
    if (last) document.getElementById("pubPreview").textContent = compose(f, copy[state.lang].pub);
  }
  const valid = (p) => [...p.querySelectorAll("input,select,textarea")].every((el) => el.checkValidity() || (el.reportValidity(), false));
  prev.addEventListener("click", () => show(i - 1));
  next.addEventListener("click", () => {
    if (!valid(panels[i])) { st.dataset.key = "errors"; st.textContent = copy[state.lang].errors; return; }
    st.textContent = ""; delete st.dataset.key;
    if (i < panels.length - 1) return show(i + 1);
    sendWA(compose(f, copy[state.lang].pub) + "\nplan: basic", st);
  });
  window.addEventListener("langchange", () => show(i));
  show(0);
})();

/* Header → WhatsApp */
document.querySelectorAll("#headerWhatsApp, .nav-advisor").forEach((el) => el.addEventListener("click", (e) => {
  e.preventDefault();
  window.open(WA + encodeURIComponent(copy[state.lang].wa), "_blank", "noopener,noreferrer");
}));

/* Catálogo: categoría + filtros */
const grid = document.getElementById("talentGrid");
let cat = "all";
function talentCards() {
  return grid ? [...grid.querySelectorAll(".talent")] : [];
}
function updateCount() {
  const cards = talentCards();
  const n = cards.filter((c) => !c.hidden).length, el = document.getElementById("talCount");
  if (el) el.textContent = n + " " + copy[state.lang].count;
  const no = document.getElementById("noRes"); if (no) no.hidden = n > 0;
}
function applyFilters() {
  const sel = [...document.querySelectorAll("#talFilters select")].filter((s) => s.value);
  talentCards().forEach((c) => {
    const okCat = cat === "all" || c.dataset.cat === cat;
    const okSel = sel.every((s) => {
      const key = s.dataset.f;
      const hay = (c.dataset[key] || "").toLowerCase().split(/\s+/).filter(Boolean);
      return hay.includes(String(s.value).toLowerCase());
    });
    c.hidden = !(okCat && okSel);
  });
  updateCount();
}
document.querySelectorAll("#catChips .filter").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll("#catChips .filter").forEach((x) => x.classList.remove("active"));
  b.classList.add("active");
  cat = b.dataset.cat;
  applyFilters();
}));
document.querySelectorAll("#talFilters select").forEach((s) => s.addEventListener("change", applyFilters));
window.addEventListener("langchange", applyFilters);
applyFilters();
applyLanguage();

/* Hero carousel */
(function () {
  const root = document.getElementById("heroCarousel");
  if (!root) return;
  const slides = Array.from(root.querySelectorAll(".hero-carousel-slide"));
  const dots = Array.from(root.querySelectorAll(".hero-carousel-dots button"));
  const prevBtn = document.getElementById("heroCarouselPrev");
  const nextBtn = document.getElementById("heroCarouselNext");
  let current = 0;
  let timer = null;
  const AUTOPLAY_MS = 5000;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
      dot.setAttribute("aria-selected", i === current ? "true" : "false");
    });
  }
  function next() {
    goTo(current + 1);
  }
  function prev() {
    goTo(current - 1);
  }
  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  nextBtn && nextBtn.addEventListener("click", () => {
    next();
    startAutoplay();
  });
  prevBtn && prevBtn.addEventListener("click", () => {
    prev();
    startAutoplay();
  });
  dots.forEach((dot) =>
    dot.addEventListener("click", () => {
      goTo(Number(dot.dataset.index));
      startAutoplay();
    })
  );
  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  goTo(0);
  startAutoplay();
})();

/* Scroll progress + to-top + reveal */
(function () {
  const reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  const toTop = document.createElement("button");
  toTop.type = "button";
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", copy[state.lang].toTop);
  toTop.textContent = "↑";
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  );
  document.body.appendChild(toTop);

  const topbar = document.querySelector(".topbar");
  let ticking = false;
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    if (topbar) topbar.classList.toggle("is-scrolled", y > 8);
    toTop.classList.toggle("show", y > 600);
    ticking = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  onScroll();

  const carousel = document.getElementById("heroCarousel");
  if (carousel && !reduce) {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => carousel.classList.add("kb-on"))
    );
  }

  if ("IntersectionObserver" in window) {
    const targets = document.querySelectorAll(
      ".section-heading, .service-grid, .cases-grid, .timeline, .talent-grid, .market-grid, .compare, .faq-list, .contact-intro, .lead-form"
    );
    if (targets.length) {
      document.documentElement.classList.add("js-reveal");
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
      targets.forEach((el) => {
        el.classList.add("reveal");
        io.observe(el);
      });
    }
  }
})();



/* Aviso de privacidad */
(function () {
  const dlg = document.getElementById("privacyDialog");
  if (!dlg) return;
  const close = () => dlg.close();
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-privacy]");
    if (!a) return;
    e.preventDefault();
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  });
  document.getElementById("privacyClose")?.addEventListener("click", close);
  document.getElementById("privacyOk")?.addEventListener("click", close);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
})();


/* Menú hamburguesa (móvil / tablet) */
(function () {
  const bar = document.querySelector(".topbar"), btn = document.getElementById("navToggle");
  if (!bar || !btn) return;
  const set = (open) => { bar.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", () => set(!bar.classList.contains("is-open")));
  bar.addEventListener("click", (e) => { if (e.target.closest(".nav a, .header-cta, .audience-item")) set(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  window.matchMedia("(min-width:1281px)").addEventListener("change", (e) => { if (e.matches) set(false); });
})();
