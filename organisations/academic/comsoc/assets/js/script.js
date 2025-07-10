let colorMode = "dark";

function addExpandableProperty() {
  const clickables = document.querySelectorAll(".clickable");

  clickables.forEach(function (el) {
    el.addEventListener("click", function () {
      const parent = el.parentElement;
      parent.classList.toggle("container-xl");
    });
  });
}

document.addEventListener("DOMContentLoaded", addExpandableProperty());

function toggleColorMode() {
  const body = document.getElementById("body");
  colorMode = colorMode == "light" ? "dark" : "light";
  body.setAttribute("data-bs-theme", colorMode);
}