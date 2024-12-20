const mockApiURLs = [
    "https://67603a526be7889dc35d40f7.mockapi.io/Fotos",
    "https://67603a526be7889dc35d40f7.mockapi.io/Foto",
    "https://676407bb17ec5852caeae5b5.mockapi.io/Fotos",
    "https://676407bb17ec5852caeae5b5.mockapi.io/Foto",
    "https://6764089117ec5852caeae967.mockapi.io/Fotos",
    "https://6764089117ec5852caeae967.mockapi.io/Foto",
    "https://6764094b17ec5852caeaec28.mockapi.io/Fotos",
    "https://6764094b17ec5852caeaec28.mockapi.io/Foto",
];

const cloudinaryURLs = [
    { url: "https://api.cloudinary.com/v1_1/dbraqaqko/image/upload", preset: "ml_default" },
    { url: "https://api.cloudinary.com/v1_1/dsmlkepdq/image/upload", preset: "default2" },
];


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
// Función para realizar GET en todas las URLs de forma paralela
async function fetchAllDataParallel(urls) {
    const promises = urls.map(async (url) => {
        try {
            const response = await fetch(url);
            if (response.ok) {
                console.log(`Datos obtenidos de URL: ${url}`);
                return await response.json();
            } else {
                console.warn(`Fallo en GET de URL: ${url}`);
                return [];
            }
        } catch (error) {
            console.error(`Error al intentar URL: ${url}`, error);
            return [];
        }
    });

    const results = await Promise.all(promises);
    return results.flat();
}

// Función para realizar POST con respaldo en caso de error
async function postWithFallback(urls, data) {
    for (const url of urls) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                console.log(`Datos enviados correctamente a URL: ${url}`);
                return;
            } else {
                console.warn(`Fallo en POST a URL: ${url}`);
            }
        } catch (error) {
            console.error(`Error al intentar POST a URL: ${url}`, error);
        }
    }

    throw new Error("Todas las URLs fallaron en el POST");
}

// Función para intentar subir imagen a múltiples URLs de Cloudinary
async function uploadToCloudinaryFallback(file) {
    for (const { url, preset } of cloudinaryURLs) {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", preset);

            const response = await fetch(url, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`Imagen subida exitosamente a Cloudinary: ${url}`);
                return data.secure_url;
            } else {
                console.warn(`Fallo en subida a Cloudinary: ${url}`);
            }
        } catch (error) {
            console.error(`Error subiendo a Cloudinary: ${url}`, error);
        }
    }

    throw new Error("Todas las URLs de Cloudinary fallaron en la subida");
}

// Función para formatear las fechas
function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");
    const heart = day === "09" ? "❤️" : "";
    return `${heart}${day}/${month}/${year}${heart}`;
}

// Cargar imágenes desde MockAPI
async function loadImages(filterDate = "todas") {
    try {
        const images = await fetchAllDataParallel(mockApiURLs);

        const filteredImages = filterDate === "todas" ? images : images.filter(image => image.fecha === filterDate);

        const container = document.getElementById("imagesContainer");
        container.innerHTML = "";

        const groupedImages = {};
        filteredImages.forEach((image) => {
            if (!groupedImages[image.fecha]) {
                groupedImages[image.fecha] = [];
            }
            groupedImages[image.fecha].push(image);
        });

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

                img.setAttribute("data-aos", "fade-up");
                img.setAttribute("data-aos-anchor-placement", "center-bottom");

                img.onload = () => {
                    if (img.naturalWidth > img.naturalHeight) {
                        img.classList.add("horizontal");
                    }
                };

                img.addEventListener("click", () => {
                    Swal.fire({
                        imageUrl: image.url,
                        imageAlt: "Imagen ampliada",
                        width: img.naturalWidth > img.naturalHeight ? 1200 : 1000,
                        height: img.naturalWidth > img.naturalHeight ? 1200 : 800,
                        showCloseButton: true,
                        showConfirmButton: false,
                        customClass: { popup: "enlarged-image-modal" },
                    });
                });

                div.appendChild(img);
                imagesWrapper.appendChild(div);
            });

            const dateLine = document.createElement("div");
            dateLine.classList.add("date-line");
            dateLine.textContent = formatDate(date);

            dateContainer.appendChild(dateLine);
            dateContainer.appendChild(imagesWrapper);
            container.appendChild(dateContainer);
        });

        handleMouseMove();

    } catch (error) {
        console.error("Error cargando imágenes:", error);
    }
}

// Cargar fechas únicas y agregarlas al filtro
async function loadDates() {
    try {
        const images = await fetchAllDataParallel(mockApiURLs);

        const dates = [...new Set(images.map(image => image.fecha))];
        dates.sort((a, b) => new Date(a) - new Date(b));

        const dateFilter = document.getElementById("dateFilter");

        dates.forEach(date => {
            const option = document.createElement("option");
            option.value = date;
            option.textContent = formatDate(date);
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

        const imageUrl = await uploadToCloudinaryFallback(imageFile);
        await postWithFallback(mockApiURLs, { url: imageUrl, fecha });

        Swal.fire("Éxito", "Imagen subida correctamente", "success");
        loadImages();

    } catch (error) {
        console.error("Error subiendo la imagen:", error);
        Swal.fire("Error", "Error subiendo la imagen. Revisa la consola.", "error");
    }
});

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


loadDates();
loadImages();
