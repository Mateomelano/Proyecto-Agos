document.addEventListener("DOMContentLoaded", function () {
    // Variables iniciales
    let currentYear = localStorage.getItem("lastYear") ? parseInt(localStorage.getItem("lastYear")) : 2024;
    let currentMonth = localStorage.getItem("lastMonth") ? parseInt(localStorage.getItem("lastMonth")) : 8; // Septiembre
    const startYear = 2024;
    const startMonth = 8; // Septiembre 2024

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

    // Función para guardar el último mes y año visitados
    function saveLastVisited(year, month) {
        localStorage.setItem("lastYear", year);
        localStorage.setItem("lastMonth", month);
    }

    // Función para generar el calendario
    function generateCalendar(year, month) {
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


                    // Agregar la clase "nine-day" al día 9
                    if (dayCounter === 9) {
                        cell.classList.add("nine-day");
                    }

                    // Restaurar corazón si existe en los datos
                    if (heartsData[dateKey]) {
                        const heartIcon = document.createElement("img");
                        heartIcon.classList.add("heart");
                        heartIcon.src = "../img/corazones.png"; // Reemplaza con el enlace deseado
                        heartIcon.alt = "Heart";
                        heartIcon.style.width = "40px"; // Ajusta el tamaño
                        heartIcon.style.height = "40px";
                        cell.appendChild(heartIcon);
                    }

                    if (dayCounter === 9 && (year > 2024 || (year === 2024 && month >= 9))) {
                        const romanticIcon = document.createElement("img"); // Cambiar a img
                        romanticIcon.classList.add("romantic");
                        romanticIcon.src = "../img/aniversario.png"; // Ruta de la imagen
                        romanticIcon.alt = "Aniversario"; // Texto alternativo para la imagen
                        romanticIcon.style.width = "40px"; // Ajusta el tamaño de la imagen
                        romanticIcon.style.height = "40px"; // Ajusta el tamaño de la imagen
                        cell.appendChild(romanticIcon);
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
        if (currentMonth < startMonth && currentYear === startYear) {
            currentMonth = startMonth; // No permitir meses anteriores a septiembre 2024
        } else if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }

        if (currentYear === startYear && currentMonth < startMonth) {
            currentMonth = startMonth; // Asegurar límite inferior
        }

        saveLastVisited(currentYear, currentMonth);
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
            const heartIcon = document.createElement("img");
            heartIcon.classList.add("heart");
            heartIcon.src = "../img/corazones.png"; // Reemplaza con el enlace deseado
            heartIcon.alt = "Heart";
            heartIcon.style.width = "40px"; // Ajusta el tamaño
            heartIcon.style.height = "40px";
            cell.appendChild(heartIcon);
            heartsData[dateKey] = true; // Agregar al almacenamiento
        }

        saveHeartsData();
    });

    // Event Listeners para las flechas de navegación
    document.getElementById("prevMonth").addEventListener("click", () => changeMonth(-1));
    document.getElementById("nextMonth").addEventListener("click", () => changeMonth(1));

    // Generar el calendario inicial
    saveLastVisited(currentYear, currentMonth);
    generateCalendar(currentYear, currentMonth);
});
