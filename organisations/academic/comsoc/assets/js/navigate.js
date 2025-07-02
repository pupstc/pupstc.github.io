const maincontent = document.getElementById('maincontent');

document.addEventListener("DOMContentLoaded", loadPage('home'));

function loadPage(content = 'home') {
  fetch(`content/${content}.html`)
    .then(response => response.text())
    .then(data => {
      maincontent.innerHTML = data;
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      addExpandableProperty();
    })
    .catch(error => console.error('Error fetching file:', error));
}
