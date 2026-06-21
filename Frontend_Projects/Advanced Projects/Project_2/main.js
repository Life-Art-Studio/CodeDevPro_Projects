const navItems = document.querySelectorAll(".nav-item[data-target]");
const pageSections = document.querySelectorAll(".page-section");

navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();

    const targetId = item.getAttribute("data-target");
    if (!targetId) return;

    // Remove active class from all nav items
    navItems.forEach((nav) => nav.classList.remove("active"));

    // Hide all page sections
    pageSections.forEach((section) => section.classList.remove("active"));

    // Set clicked nav item to active
    item.classList.add("active");

    // Show the target section
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.add("active");
    }
  });
});
