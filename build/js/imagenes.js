const mockApiURL = "https://67603a526be7889dc35d40f7.mockapi.io/Fotos"; // URL de MockAPI
const cloudinaryURL = "https://api.cloudinary.com/v1_1/77017d0d-11ce-4b5d-8122-5166c98fc2ba/image/upload"; // URL de tu cuenta de Cloudinary
const cloudinaryPreset = "ml_default"; // Nombre del Upload Preset de Cloudinary

// Cargar imágenes desde MockAPI
async function loadImages() {
    try {
        const response = await fetch(mockApiURL);
        const images = await response.json();

        const container = document.getElementById("imagesContainer");
        container.innerHTML = ""; // Limpiar el contenedor

        images.forEach((image) => {
            const div = document.createElement("div");
            div.classList.add("polaroid");
            div.innerHTML = `
                <img src="${image.url}" alt="Imagen subida" />
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Error cargando imágenes:", error);
    }
}

// Manejar el formulario de subida
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const imageFile = document.getElementById("imageInput").files[0];

    if (!imageFile) {
        alert("Por favor selecciona una imagen");
        return;
    }

    // Subir imagen a Cloudinary
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", cloudinaryPreset);

    try {
        const response = await fetch(cloudinaryURL, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        const imageUrl = data.secure_url; // URL pública de la imagen subida

        // Guardar URL en MockAPI
        await fetch(mockApiURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: imageUrl }),
        });

        alert("Imagen subida correctamente");
        loadImages(); // Recargar las imágenes
    } catch (error) {
        console.error("Error subiendo la imagen:", error);
    }
});

// Cargar imágenes al cargar la página
loadImages();
