// Selecciona todos los enlaces dentro del nav
const navLinks = document.querySelectorAll('nav a');

// Obtén la URL actual de la página
const currentPath = window.location.pathname;

// Marca el enlace activo y desmarca los demás
navLinks.forEach(link => {
  // Compara el pathname del enlace con el pathname actual
  if (link.pathname === currentPath) {
    link.classList.add('active'); // Agrega la clase 'active' al enlace actual
  } else {
    link.classList.remove('active'); // Remueve la clase 'active' de los demás
  }
});
