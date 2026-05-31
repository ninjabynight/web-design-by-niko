const navToggle = document.querySelector(".nav-toggle");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");

    const isOpen = document.body.classList.contains("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}