var body = document.getElementById("body");
var footerImage = document.getElementById("footerImage");

var dataSet = {
  "dark": {
    "logo": "../../../../assets/img/CS WM W.png"
  },
  "light": {
    "logo": "../../../../assets/img/CS WM B.png"
  }
}

var theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";

function setTheme(){
  body.setAttribute("data-bs-theme", theme);
  footerImage.src = dataSet[theme].logo;
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  theme = event.matches ? "dark" : "light";
  setTheme();
});

setTheme();