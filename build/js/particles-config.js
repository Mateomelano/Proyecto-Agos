const imageSources = [
  "../img/nube.png", // Primera opción (ruta local)
  "./img/nube.png", // Segunda opción (ruta en línea)
];

// Función para encontrar la primera imagen válida
function findValidImage(sources, callback) {
  let index = 0;

  function testNext() {
    if (index >= sources.length) {
      console.error("No se encontró ninguna imagen válida.");
      return;
    }

    const img = new Image();
    img.onload = () => callback(sources[index]); // Si carga, usa esta
    img.onerror = () => {
      index++;
      testNext(); // Si falla, prueba la siguiente
    };
    img.src = sources[index];
  }

  testNext();
}

// Usar la función para cargar la imagen correcta y configurar particlesJS
findValidImage(imageSources, (validSrc) => {
  particlesJS("particles-js", {
    particles: {
      number: {
        value: 50, // Cantidad de nubes visibles
        density: {
          enable: false, // Deshabilitar densidad para un movimiento más disperso
        },
      },
      color: {
        value: "#ffffff", // Ignorado para imágenes
      },
      shape: {
        type: "image", // Usamos imágenes como partículas
        image: {
          src: validSrc, // Usar la imagen válida encontrada
          width: 300,
          height: 300,
        },
      },
      opacity: {
        value: 1, // Opacidad de las nubes
        random: false,
      },
      size: {
        value: 100, // Tamaño base de las nubes
        random: true, // Tamaño aleatorio para cada nube
        anim: {
          enable: false, // Deshabilitamos la animación de tamaño
        },
      },
      move: {
        enable: true,
        speed: 2.5, // Velocidad del movimiento
        direction: "right", // Las nubes se mueven hacia la derecha
        random: false,
        straight: true, // Movimiento lineal (sin rebotes)
        out_mode: "out", // Las partículas reaparecen al salir del canvas
        bounce: false,
        attract: {
          enable: true, // Deshabilitamos la atracción de las nubes
        },
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true, // Deshabilitamos interacción con el cursor
        },
        onclick: {
          enable: true, // Deshabilitamos interacción al hacer clic
        },
      },
    },
    retina_detect: true,
  });
});
