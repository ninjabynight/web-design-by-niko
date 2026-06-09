const navToggle = document.querySelector(".nav-toggle");

if (navToggle) {
  const setNavState = (isOpen) => {
    document.body.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  };

  navToggle.addEventListener("click", () => {
    setNavState(!document.body.classList.contains("menu-open"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
      setNavState(false);
      navToggle.focus();
    }
  });
}

// Smooth expandable project cards

document.querySelectorAll("details.project-card").forEach((card) => {
  const summary = card.querySelector("summary");
  const details = card.querySelector(".project-details");

  if (!summary || !details) return;

  summary.addEventListener("click", (event) => {
    event.preventDefault();

    if (card.dataset.animating === "true") return;

    const isOpen = card.hasAttribute("open");
    card.dataset.animating = "true";

    if (isOpen) {
      details.style.maxHeight = `${details.scrollHeight}px`;

      requestAnimationFrame(() => {
        details.style.maxHeight = "0px";
        details.style.opacity = "0";
        details.style.marginTop = "0px";
        details.style.paddingTop = "0px";
      });

      window.setTimeout(() => {
        card.removeAttribute("open");
        details.removeAttribute("style");
        card.dataset.animating = "false";
      }, 360);
    } else {
      card.setAttribute("open", "");

      details.style.maxHeight = "0px";
      details.style.opacity = "0";
      details.style.marginTop = "0px";
      details.style.paddingTop = "0px";

      requestAnimationFrame(() => {
        details.style.maxHeight = `${details.scrollHeight + 40}px`;
        details.style.opacity = "1";
        details.style.marginTop = "22px";
        details.style.paddingTop = "20px";
      });

      window.setTimeout(() => {
        card.dataset.animating = "false";
      }, 360);
    }
  });
});

// Shared hero and background parallax

const pageShell = document.querySelector(".page-shell");
const pageHero = document.querySelector("main > .page-hero");
const siteHeader = document.querySelector(".site-header");
const siteFooter = document.querySelector(".site-footer");
const parallaxHeroes = Array.from(document.querySelectorAll(".page-hero"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const clamp = (min, value, max) => Math.min(max, Math.max(min, value));

const createParallaxLayer = (parent, className) => {
  const existingLayer = Array.from(parent.children).find((child) => child.classList.contains(className));

  if (existingLayer) return existingLayer;

  const layer = document.createElement("div");
  layer.className = className;
  layer.setAttribute("aria-hidden", "true");
  parent.insertBefore(layer, parent.firstElementChild);

  return layer;
};

const setTranslateY = (element, y, scale = 1) => {
  if (!element) return;

  const scaleValue = scale === 1 ? "" : ` scale(${scale})`;

  element.style.transform = `translate3d(0, ${y.toFixed(3)}px, 0)${scaleValue}`;
};

const parallaxEntries = parallaxHeroes.map((hero) => {
  const layer = createParallaxLayer(hero, "page-hero-backdrop");

  hero.classList.add("has-parallax-layer");

  return {
    hero,
    layer,
    content: hero.querySelector(".page-hero-inner"),
    imageY: 0,
    targetImageY: 0,
    textY: 0,
    targetTextY: 0,
  };
});

const syncPageBackgroundStart = () => {
  if (!pageShell || !pageHero) return;

  const headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
  const footerHeight = siteFooter ? siteFooter.offsetHeight : 0;

  pageShell.style.setProperty("--page-bg-top", `${headerHeight + pageHero.offsetHeight}px`);
  pageShell.style.setProperty("--page-bg-bottom", `${footerHeight}px`);
};

const resetParallax = () => {
  parallaxEntries.forEach((entry) => {
    entry.imageY = 0;
    entry.targetImageY = 0;
    entry.textY = 0;
    entry.targetTextY = 0;
    setTranslateY(entry.layer, 0);
    setTranslateY(entry.content, 0);
  });

};

const setParallaxTargets = () => {
  const isCompactViewport = window.innerWidth <= 640;
  const heroImageMax = isCompactViewport ? 72 : 104;
  const heroImageMin = isCompactViewport ? -34 : -46;
  const heroTextMin = isCompactViewport ? -18 : -30;
  const headerHeight = siteHeader ? siteHeader.offsetHeight : 0;

  parallaxEntries.forEach((entry) => {
    const heroStart = Math.max(0, entry.hero.offsetTop - headerHeight);
    const heroScroll = window.scrollY - heroStart;

    entry.targetImageY = clamp(heroImageMin, heroScroll * 0.2, heroImageMax);
    entry.targetTextY = clamp(heroTextMin, heroScroll * -0.072, 0);
  });
};

syncPageBackgroundStart();

let parallaxFrame = 0;

const updateParallax = (snap = false) => {
  parallaxFrame = 0;

  if (prefersReducedMotion.matches) {
    resetParallax();
    return;
  }

  setParallaxTargets();

  const ease = 0.12;
  let shouldContinue = false;

  parallaxEntries.forEach((entry) => {
    entry.imageY = snap ? entry.targetImageY : entry.imageY + (entry.targetImageY - entry.imageY) * ease;
    entry.textY = snap ? entry.targetTextY : entry.textY + (entry.targetTextY - entry.textY) * ease;

    setTranslateY(entry.layer, entry.imageY);
    setTranslateY(entry.content, entry.textY);

    shouldContinue =
      shouldContinue ||
      Math.abs(entry.targetImageY - entry.imageY) > 0.04 ||
      Math.abs(entry.targetTextY - entry.textY) > 0.04;
  });

  if (shouldContinue) {
    parallaxFrame = window.requestAnimationFrame(() => updateParallax());
  }
};

const requestParallax = (snap = false) => {
  if (snap) {
    if (parallaxFrame) {
      window.cancelAnimationFrame(parallaxFrame);
      parallaxFrame = 0;
    }

    updateParallax(true);
    return;
  }

  if (!parallaxFrame) {
    parallaxFrame = window.requestAnimationFrame(() => updateParallax());
  }
};

resetParallax();
requestParallax(true);

window.addEventListener("scroll", () => requestParallax(), { passive: true });

window.addEventListener("resize", () => {
  syncPageBackgroundStart();
  requestParallax(true);
});

window.addEventListener("load", () => {
  syncPageBackgroundStart();
  requestParallax(true);
});

if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", () => {
    syncPageBackgroundStart();
    requestParallax(true);
  });
} else if (typeof prefersReducedMotion.addListener === "function") {
  prefersReducedMotion.addListener(() => {
    syncPageBackgroundStart();
    requestParallax(true);
  });
}
