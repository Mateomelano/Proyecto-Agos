const videoLinks = [
    { url: "https://www.youtube.com/embed/5w3Jd6uvpD8", title: "Huracan Meri - Eros Ramazotti " },
    { url: "https://www.youtube.com/embed/FUFDzV2GmBM", title: "Heaven Knows I’m Miserable Now - The Smiths" },
    { url: "https://www.youtube.com/embed/pdw9igpfBzA", title: "Wonderful Tonigh - Eric Clapton" },
    { url: "https://www.youtube.com/embed/XiQTXNe2Cy4", title: "Como te extraño mi amor - Leo Dan" },
    { url: "https://www.youtube.com/embed/FvAnvRQbO94", title: "Los Aviones - Andres Calamaro - Especial 1er Mes" },
];

// Función para cargar los videos
function loadVideos() {
    const container = document.createElement("div");
    container.id = "videosContainer";
    document.body.appendChild(container);

    videoLinks.forEach((video) => {
        // Crear el contenedor principal
        const videoCard = document.createElement("div");
        videoCard.classList.add("polaroid-video");

        // Crear el iframe para el video
        const iframe = document.createElement("iframe");
        iframe.src = video.url;
        iframe.frameBorder = "0";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;

        // Crear el título
        const title = document.createElement("div");
        title.classList.add("video-title");
        title.textContent = video.title;

        // Agregar elementos al contenedor
        videoCard.appendChild(iframe);
        videoCard.appendChild(title);
        container.appendChild(videoCard);
    });
}

// Ejecutar la función al cargar la página
document.addEventListener("DOMContentLoaded", loadVideos);
