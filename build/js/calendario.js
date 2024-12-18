document.addEventListener("DOMContentLoaded", function () {
    // Variables para el año y mes actuales
    let currentYear = 2024;
    let currentMonth = 8; // Septiembre (indexado desde 0)

    // URL de la API Mock
    const mockApiURL = "https://67603a526be7889dc35d40f7.mockapi.io/Fotos";

    // Array de nombres de meses
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Objeto para almacenar las fechas con corazones
    let heartsData = JSON.parse(localStorage.getItem("heartsData")) || {};

    // Función para guardar corazones en localStorage
    function saveHeartsData() {
        localStorage.setItem("heartsData", JSON.stringify(heartsData));
    }

    // Función para verificar si hay imágenes para una fecha específica
    async function checkImagesForDate(dateKey) {
        try {
            const response = await fetch(mockApiURL);
            const images = await response.json();
            return images.some(image => image.fecha === dateKey); // Verificar si hay imágenes con esa fecha
        } catch (error) {
            console.error("Error verificando imágenes para la fecha:", error);
            return false;
        }
    }

    // Función para cargar imágenes de una fecha específica
    async function loadImagesForDate(dateKey) {
        try {
            const response = await fetch(mockApiURL);
            const images = await response.json();
            const filteredImages = images.filter(image => image.fecha === dateKey);

            // Mostrar imágenes en un contenedor
            const imagesContainer = document.getElementById("imagesContainer");
            imagesContainer.innerHTML = `<h3>Imágenes del ${dateKey}</h3>`;
            filteredImages.forEach(img => {
                const imgElement = document.createElement("img");
                imgElement.src = img.url;
                imgElement.alt = `Imagen de ${dateKey}`;
                imgElement.style.width = "100px";
                imgElement.style.margin = "5px";
                imagesContainer.appendChild(imgElement);
            });

            // Desplazarse al contenedor de imágenes
            imagesContainer.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            console.error("Error cargando imágenes:", error);
        }
    }

    // Función para generar el calendario
    async function generateCalendar(year, month) {
        const calendarBody = document.getElementById("calendar-body");
        const currentMonthLabel = document.getElementById("currentMonth");
        const firstDay = new Date(year, month, 1).getDay(); // Día de la semana del primer día del mes
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total de días en el mes

        // Ajustar el índice del primer día al formato de lunes a domingo
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        // Actualizar el encabezado con el mes y año actuales
        currentMonthLabel.textContent = `${monthNames[month]} ${year}`;

        let dayCounter = 1;
        calendarBody.innerHTML = "";

        for (let week = 0; week < 6; week++) {
            const row = document.createElement("tr");

            for (let day = 0; day < 7; day++) {
                const cell = document.createElement("td");

                if (week === 0 && day < adjustedFirstDay) {
                    // Celdas vacías antes del inicio del mes
                    cell.innerHTML = "";
                } else if (dayCounter > daysInMonth) {
                    // Celdas vacías después del fin del mes
                    cell.innerHTML = "";
                } else {
                    // Día del mes
                    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayCounter).padStart(2, "0")}`;
                    cell.innerHTML = `<span>${dayCounter}</span>`;
                    cell.dataset.date = dateKey; // Asignar la fecha como atributo

                    // Restaurar corazón si existe en los datos
                    if (heartsData[dateKey]) {
                        const heartIcon = document.createElement("span");
                        heartIcon.classList.add("heart");
                        heartIcon.innerHTML = "❤️";
                        cell.appendChild(heartIcon);

                        // Verificar si hay imágenes para esa fecha y agregar ícono de imagen
                        const hasImages = await checkImagesForDate(dateKey);
                        if (hasImages) {
                            const imageIcon = document.createElement("span");
                            imageIcon.classList.add("image-icon");
                            imageIcon.innerHTML = "📷";
                            cell.appendChild(imageIcon);
                        }
                    }

                    dayCounter++;
                }

                row.appendChild(cell);
            }

            calendarBody.appendChild(row);

            // Detener si ya no hay días que mostrar
            if (dayCounter > daysInMonth) break;
        }
    }

    // Función para cambiar de mes
    function changeMonth(offset) {
        currentMonth += offset;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentYear, currentMonth);
    }

    // Alternar corazones en las celdas
    document.getElementById("calendar-body").addEventListener("click", function (e) {
        const cell = e.target.closest("td");
        if (!cell || !cell.dataset.date) return;

        const dateKey = cell.dataset.date;
        const heart = cell.querySelector(".heart");
        if (heart) {
            heart.remove();
            delete heartsData[dateKey]; // Quitar del almacenamiento
        } else {
            const heartIcon = document.createElement("span");
            heartIcon.classList.add("heart");
            heartIcon.innerHTML = "❤️";
            cell.appendChild(heartIcon);
            heartsData[dateKey] = true; // Agregar al almacenamiento
        }

        saveHeartsData();
    });

    // Event Listeners para las flechas de navegación
    document.getElementById("prevMonth").addEventListener("click", () => changeMonth(-1));
    document.getElementById("nextMonth").addEventListener("click", () => changeMonth(1));

    // Generar el calendario inicial
    generateCalendar(currentYear, currentMonth);
});
