var body = document.getElementById("body");
var colorMode = "dark";

var dataSet = {
  "dark": {
    "logo": "../../../../assets/img/CS WM W.png"
  },
  "light": {
    "logo": "../../../../assets/img/CS WM B.png"
  }
}

function toggleColorMode() {
  const navImage = document.getElementById("navImage");
  const footerImage = document.getElementById("footerImage");

  colorMode = colorMode == "light" ? "dark" : "light";
  body.setAttribute("data-bs-theme", colorMode);
  navImage.src = dataSet[colorMode].logo;
  footerImage.src = dataSet[colorMode].logo;
}

function populateSite(){
  const navbar = document.getElementById("navbar");
  navbar.innerHTML = `
    <div class="container-xl p-0">
      <div class="navigation glass shadow-sm p-4 px-xl-5 poppins bg-body z-1 rounded-5 border-bottom">
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-center">
          <div class="d-flex flex-row align-items-center">
            <a href="../">
              <img class="me-2 bg-white rounded-circle" src="../../../../../assets/img/logo/comsoc.png"
                style="width: 50px; height: 50px;">
            </a>
            <a href="../../../../">
              <img class="me-2" src="../../../../assets/img/logo.png" style="height: 50px; width: auto;">
            </a>
            <a href="../../../../">
              <img class="" id="navImage" src="../../../../assets/img/CS WM W.png" style="height: 30px;">
            </a>
          </div>
          <div class="d-flex flex-row mt-4 mt-lg-0 flex-wrap justify-content-center align-items-center">
            <a href="../../../../" class="nav-link">
              <small>Home</small>
            </a>
            <a href="../../../../" class="ms-3 ms-sm-4 ms-md-5 ms-lg-4 ms-xl-5 nav-link">
              <small>About</small>
            </a>
            <button onclick="toggleColorMode()" class="btn btn-sm btn-secondary ms-3 ms-sm-4 ms-md-5 ms-lg-4 ms-xl-5">
              <i class="fa fa-moon-o"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const footer = document.getElementById("footer");
  footer.innerHTML = `
    <div class="row">
      <div class="col">
        <div class="mb-3">
          <img src="../../../../../../../../assets/img/logo/pup.png" style="width: 50px">
          <img src="../../../../../assets/img/logo/comsoc.png" class="ms-2 bg-white rounded-circle" style="width: 50px">
          <img src="../../../../assets/img/logo.png" class="ms-2" style="height: 50px">
          <img id="footerImage" src="../../../../assets/img/CS WM W.png" class="ms-2" style="height: 30px">
        </div>
        <div class="my-4"><small>The Cloud Sentinel is the official publication of the Computer Society under its
            publication committee.</small></div>
        <div class="my-4"><small>The Computer Society is the official academic organization for students and alumni of
            the BSIT program of the Polytechnic University of the Philippines Sto Tomas Campus.
          </small></div>
        <div class="mt-5 text-body-secondary">© 2025</div>
      </div>
    </div>
  `;
}