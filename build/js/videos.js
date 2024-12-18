const apiKey = "AIzaSyCCQfBn0QlqKmPUbaZosV-vbn7GMi16RlE"; // Tu clave API de YouTube
const channelId = "UClPKb4gAG26gYP-PFufA0wQ"; // ID del canal
const maxResults = 10; // Número de videos a mostrar

// IDs de las playlists
const playlists = [
    { id: "PLZIEfzWIUc6pg0GbH9BNDW9k8saHrHRi0", title: "Románticos" },
    { id: "PLZIEfzWIUc6rDyvEg6iTCWGAKeq29_5-L", title: "No tan románticos pero dedicados igual" },
];

// Función para decodificar entidades HTML
function decodeHtmlEntities(text) {
    const tempElement = document.createElement("textarea");
    tempElement.innerHTML = text;
    return tempElement.value;
}

// Función para obtener videos de una playlist
async function fetchPlaylistVideos(playlistId) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=${maxResults}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error("Error al obtener videos de la playlist:", error);
        return [];
    }
}

// Función para obtener los últimos videos del canal
async function fetchChannelVideos() {
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&type=video&order=date&maxResults=${maxResults}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error("Error al obtener videos del canal:", error);
        return [];
    }
}

// Función para separar videos en normales y especiales
function separateVideos(videos) {
    const specialVideos = [];
    const specialVideoIds = new Set();

    videos.forEach((video) => {
        const title = decodeHtmlEntities(video.snippet.title);
        if (title.toLowerCase().includes("especial")) {
            specialVideos.push(video);
            const videoId = video.snippet.resourceId?.videoId || video.id.videoId;
            specialVideoIds.add(videoId); // Guardar ID de video especial
        }
    });

    return { specialVideos, specialVideoIds };
}

// Función para filtrar videos de una playlist excluyendo los especiales
function filterVideos(videos, specialVideoIds) {
    return videos.filter((video) => {
        const videoId = video.snippet.resourceId?.videoId || video.id.videoId;
        return !specialVideoIds.has(videoId); // Excluir si está en la lista de especiales
    });
}

// Función para agregar la animación 3D a videos
function handleMouseMove() {
    const polaroidVideos = document.querySelectorAll('.polaroid-video');

    polaroidVideos.forEach(polaroid => {
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

// Función para mostrar videos en una sección
function displayVideos(videos, sectionTitle, container) {
    const section = document.createElement("div");
    section.classList.add("video-section");

    const title = document.createElement("h2");
    title.textContent = sectionTitle;

    section.appendChild(title);

    videos.forEach((video) => {
        const videoCard = document.createElement("div");
        videoCard.classList.add("polaroid-video"); // Clase que aplica la animación 3D

        const iframe = document.createElement("iframe");
        const videoId = video.snippet.resourceId?.videoId || video.id.videoId;
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.frameBorder = "0";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;

        const videoTitle = document.createElement("div");
        videoTitle.classList.add("video-title");
        videoTitle.textContent = decodeHtmlEntities(video.snippet.title);

        videoCard.appendChild(iframe);
        videoCard.appendChild(videoTitle);
        section.appendChild(videoCard);
    });

    container.appendChild(section);
}

// Función principal para cargar todos los videos
async function loadVideos() {
    const container = document.createElement("div");
    container.id = "videosContainer";
    document.body.appendChild(container);

    // 1. Cargar los últimos videos del canal y filtrar especiales
    const channelVideos = await fetchChannelVideos();
    const { specialVideos, specialVideoIds } = separateVideos(channelVideos);

    // Mostrar videos especiales
    displayVideos(specialVideos, "Especiales", container);

    // 2. Cargar videos de las playlists excluyendo los especiales
    for (const playlist of playlists) {
        const playlistVideos = await fetchPlaylistVideos(playlist.id);
        const filteredVideos = filterVideos(playlistVideos, specialVideoIds); // Excluir videos especiales
        displayVideos(filteredVideos, playlist.title, container);
    }

    // 3. Agregar la animación 3D a los videos
    handleMouseMove();
}

// Ejecutar la función al cargar la página
document.addEventListener("DOMContentLoaded", loadVideos);
