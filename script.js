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

// Shared image parallax

const pageShell = document.querySelector(".page-shell");
const pageHero = document.querySelector("main > .page-hero");
const parallaxHeroes = document.querySelectorAll(".page-hero");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const clamp = (min, value, max) => Math.min(max, Math.max(min, value));

const syncPageBackgroundStart = () => {
  if (!pageShell || !pageHero) return;

  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.offsetHeight : 0;

  pageShell.style.setProperty("--page-bg-top", `${headerHeight + pageHero.offsetHeight}px`);
};

const resetParallax = () => {
  parallaxHeroes.forEach((hero) => {
    hero.style.setProperty("--hero-parallax-y", "0px");
  });

  if (pageShell) {
    pageShell.style.setProperty("--body-parallax-y", "0px");
  }
};

syncPageBackgroundStart();

let parallaxTicking = false;

const updateParallax = () => {
  if (prefersReducedMotion.matches) {
    resetParallax();
    parallaxTicking = false;
    return;
  }

  parallaxHeroes.forEach((hero) => {
    const rect = hero.getBoundingClientRect();
    const offset = clamp(-52, rect.top * -0.14, 72);

    hero.style.setProperty("--hero-parallax-y", `${offset}px`);
  });

  if (pageShell) {
    const bodyOffset = clamp(0, window.scrollY * 0.045, 86);

    pageShell.style.setProperty("--body-parallax-y", `${bodyOffset}px`);
  }

  parallaxTicking = false;
};

const requestParallax = () => {
  if (!parallaxTicking) {
    window.requestAnimationFrame(updateParallax);
    parallaxTicking = true;
  }
};

resetParallax();

window.addEventListener("resize", () => {
  syncPageBackgroundStart();
  resetParallax();
});

if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", () => {
    syncPageBackgroundStart();
    requestParallax();
  });
} else if (typeof prefersReducedMotion.addListener === "function") {
  prefersReducedMotion.addListener(() => {
    syncPageBackgroundStart();
    requestParallax();
  });
}
