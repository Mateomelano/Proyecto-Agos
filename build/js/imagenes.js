const mockApiURL = "https://67603a526be7889dc35d40f7.mockapi.io/Fotos";
const cloudinaryURL = "https://api.cloudinary.com/v1_1/dbraqaqko/image/upload"; // Cloud Name correcto
const cloudinaryPreset = "ml_default"; // Upload Preset

// Función para manejar la inclinación de las imágenes
function handleMouseMove() {
    const polaroids = document.querySelectorAll('.polaroid');

    polaroids.forEach(polaroid => {
        polaroid.addEventListener('mousemove', (e) => {
            const { offsetWidth: width, offsetHeight: height } = polaroid;
            const { offsetX: x, offsetY: y } = e;

            // Calcular el ángulo de inclinación según la posición del mouse
            const rotateX = (y / height - 0.5) * 20;  // Inclinación en el eje X
            const rotateY = (x / width - 0.5) * -20;  // Inclinación en el eje Y

            // Aplicar el efecto de inclinación y movimiento dinámico
            polaroid.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        // Restaurar la inclinación al salir del área de la imagen
        polaroid.addEventListener('mouseleave', () => {
            polaroid.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });
}

// Cargar imágenes desde MockAPI
async function loadImages(filterDate = 'todas') {
    try {
        const response = await fetch(mockApiURL);
        const images = await response.json();

        // Filtrar las imágenes por fecha, si es necesario
        const filteredImages = filterDate === 'todas' ? images : images.filter(image => image.fecha === filterDate);

        const container = document.getElementById("imagesContainer");
        container.innerHTML = ""; // Limpiar el contenedor

        filteredImages.forEach((image) => {
            const div = document.createElement("div");
            div.classList.add("polaroid"); // Aplicar clase Polaroid
            div.innerHTML = `
                <img src="${image.url}" alt="Imagen subida" class="image-clickable" />
                <p class="image-date">${image.fecha || "Sin fecha"}</p>
            `;

            // Agregar evento para ampliar imagen
            div.querySelector(".image-clickable").addEventListener("click", () => {
                Swal.fire({
                    imageUrl: image.url,
                    imageAlt: "Imagen ampliada",
                    showCloseButton: true,
                    showConfirmButton: false,
                    customClass: {
                        popup: "enlarged-image-modal",
                    },
                });
            });

            container.appendChild(div);
        });

        // Llamar a la función para aplicar la inclinación a las imágenes
        handleMouseMove();
    } catch (error) {
        console.error("Error cargando imágenes:", error);
    }
}

// Cargar fechas únicas y agregarlas al filtro
async function loadDates() {
    try {
        const response = await fetch(mockApiURL);
        const images = await response.json();

        // Obtener fechas únicas y ordenarlas de manera ascendente
        const dates = [...new Set(images.map(image => image.fecha))]; // Obtener fechas únicas
        dates.sort((a, b) => new Date(a) - new Date(b)); // Ordenar las fechas de forma ascendente

        const dateFilter = document.getElementById("dateFilter");

        // Agregar las fechas al select
        dates.forEach(date => {
            const option = document.createElement("option");
            option.value = date;
            option.textContent = date;
            dateFilter.appendChild(option);
        });

        // Evento para cambiar el filtro de fecha
        dateFilter.addEventListener("change", (event) => {
            loadImages(event.target.value); // Recargar imágenes con el filtro seleccionado
        });

    } catch (error) {
        console.error("Error cargando las fechas:", error);
    }
}


// Manejar el evento de selección de imagen
document.getElementById("imageInput").addEventListener("change", async (e) => {
    const imageFile = e.target.files[0];

    if (!imageFile) {
        Swal.fire("Error", "Por favor selecciona una imagen", "warning");
        return;
    }

    try {
        // Mostrar ventana de SweetAlert para ingresar la fecha
        const { value: fecha } = await Swal.fire({
            title: "Ingresa la fecha",
            input: "date",
            inputPlaceholder: "Selecciona una fecha",
            showCancelButton: true,
            confirmButtonText: "Subir imagen",
            cancelButtonText: "Cancelar",
            customClass: {
                input: "custom-input-center",
                popup: "custom-popup-center",
            },
        });

        if (!fecha) {
            Swal.fire("Subida cancelada", "No se ingresó ninguna fecha", "info");
            return;
        }

        // Subir imagen a Cloudinary
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", cloudinaryPreset);

        const response = await fetch(cloudinaryURL, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Error en la subida a Cloudinary");
        }

        const data = await response.json();
        const imageUrl = data.secure_url; // URL pública de la imagen subida

        // Guardar URL y fecha en MockAPI
        await fetch(mockApiURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: imageUrl, fecha }),
        });

        Swal.fire("Éxito", "Imagen subida correctamente", "success");
        loadImages(); // Recargar las imágenes
    } catch (error) {
        console.error("Error subiendo la imagen:", error);
        Swal.fire("Error", "Error subiendo la imagen. Revisa la consola.", "error");
    }

});

// Cargar imágenes al cargar la página
loadDates(); // Cargar fechas antes de las imágenes
loadImages(); // Cargar las imágenes
