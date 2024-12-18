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

            const rotateX = (y / height - 0.5) * 20;
            const rotateY = (x / width - 0.5) * -20;

            polaroid.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        polaroid.addEventListener('mouseleave', () => {
            polaroid.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });
}

// Función para formatear las fechas
function formatDate(dateString) {
    const [year, month, day] = dateString.split("-"); // Suponiendo formato ISO "YYYY-MM-DD"
    const heart = day === "09" ? "❤️" : "";
    return `${heart}${day}/${month}/${year}${heart}`;
}


// Cargar imágenes desde MockAPI
async function loadImages(filterDate = 'todas') {
    try {
        const response = await fetch(mockApiURL);
        const images = await response.json();

        // Filtrar por fecha si no es 'todas'
        const filteredImages = filterDate === 'todas' ? images : images.filter(image => image.fecha === filterDate);

        const container = document.getElementById("imagesContainer");
        container.innerHTML = "";

        // Agrupar imágenes por fecha
        const groupedImages = {};
        filteredImages.forEach((image) => {
            if (!groupedImages[image.fecha]) {
                groupedImages[image.fecha] = [];
            }
            groupedImages[image.fecha].push(image);
        });

        // Recorrer las fechas y mostrar las imágenes agrupadas
        Object.keys(groupedImages).sort((a, b) => new Date(a) - new Date(b)).forEach((date) => {
            const dateContainer = document.createElement("div");
            dateContainer.classList.add("date-group");

            const imagesWrapper = document.createElement("div");
            imagesWrapper.classList.add("images-wrapper");

            groupedImages[date].forEach((image) => {
                const div = document.createElement("div");
                div.classList.add("polaroid");

                const img = document.createElement("img");
                img.src = image.url;
                img.alt = "Imagen subida";

                // **Agregar atributos AOS**
                img.setAttribute("data-aos", "fade-up");
                img.setAttribute("data-aos-anchor-placement", "center-bottom");

                // Detectar si la imagen es horizontal
                img.onload = () => {
                    if (img.naturalWidth > img.naturalHeight) {
                        img.classList.add("horizontal");
                        
                    }
                };

                img.addEventListener("click", () => {
                    if (img.width > img.height) {
                        Swal.fire({
                            imageUrl: image.url,
                            imageAlt: "Imagen ampliada",
                            width: 1200,
                            height: 1200,
                            didOpen: () => {
                                img.setAttribute("data-aos", "fade-up");
                                img.setAttribute("data-aos-anchor-placement", "center-bottom");
                            },
                            showCloseButton: true,
                            showConfirmButton: false,
                            customClass: {
                                popup: "enlarged-image-modal",
                            },
                        });
                    } else {
                        Swal.fire({
                            imageUrl: image.url,
                            imageAlt: "Imagen ampliada",
                            width: 1000,
                            height: 800,
                            didOpen: () => {
                                img.setAttribute("data-aos", "fade-up");
                                img.setAttribute("data-aos-anchor-placement", "center-bottom");
                            },
                            showCloseButton: true,
                            showConfirmButton: false,
                            customClass: {
                                popup: "enlarged-image-modal",
                            },
                        });
                    }
                });
                div.appendChild(img);
                imagesWrapper.appendChild(div);
            });

            // Agregar fecha ANTES de las imágenes con formato día/mes/año
            const dateLine = document.createElement("div");
            dateLine.classList.add("date-line");
            dateLine.textContent = formatDate(date); // Usar formato personalizado

            dateContainer.appendChild(dateLine); // Agregar fecha
            dateContainer.appendChild(imagesWrapper); // Agregar imágenes
            container.appendChild(dateContainer); // Agregar al contenedor principal
        });

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

        const dates = [...new Set(images.map(image => image.fecha))];
        dates.sort((a, b) => new Date(a) - new Date(b));

        const dateFilter = document.getElementById("dateFilter");

        dates.forEach(date => {
            const option = document.createElement("option");
            option.value = date;
            option.textContent = formatDate(date); // Usar formato personalizado
            dateFilter.appendChild(option);
        });

        dateFilter.addEventListener("change", (event) => {
            loadImages(event.target.value);
        });

    } catch (error) {
        console.error("Error cargando las fechas:", error);
    }
}

// Manejar la subida de imágenes
document.getElementById("imageInput").addEventListener("change", async (e) => {
    const imageFile = e.target.files[0];

    if (!imageFile) {
        Swal.fire("Error", "Por favor selecciona una imagen", "warning");
        return;
    }

    try {
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

        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", cloudinaryPreset);

        const response = await fetch(cloudinaryURL, { method: "POST", body: formData });
        if (!response.ok) throw new Error("Error en la subida a Cloudinary");

        const data = await response.json();
        const imageUrl = data.secure_url;

        await fetch(mockApiURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: imageUrl, fecha }),
        });

        Swal.fire("Éxito", "Imagen subida correctamente", "success");
        loadImages();

    } catch (error) {
        console.error("Error subiendo la imagen:", error);
        Swal.fire("Error", "Error subiendo la imagen. Revisa la consola.", "error");
    }
});

loadDates();
loadImages();
