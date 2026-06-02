const navToggle = document.querySelector(".nav-toggle");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");

    const isOpen = document.body.classList.contains("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Smooth expandable project cards

document.querySelectorAll("details.project-card").forEach((card) => {
  const details = card.querySelector(".project-details");

  if (!details) return;

  card.addEventListener("click", (event) => {
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