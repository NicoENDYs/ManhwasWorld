document.addEventListener('DOMContentLoaded', function () {
    // Ruta al archivo JSON (puedes cambiar esta ruta según donde ubiques tu archivo)
    const JSON_FILE_PATH = 'manhwa.json';

    // Función para cargar los manhwas desde el archivo JSON
    async function loadManhwas() {
        try {
            // Mostrar indicador de carga
            document.getElementById('loading').style.display = 'block';
            document.getElementById('manhwa-container').style.display = 'none';

            // Obtener datos del archivo JSON
            const response = await fetch(JSON_FILE_PATH);
            if (!response.ok) {
                throw new Error('Error al cargar los datos');
            }

            const data = await response.json();
            // Asumiendo que tu JSON tiene una estructura con un array "manhwas"
            const manhwaData = data.manhwas || data;

            // Ocultar indicador de carga
            document.getElementById('loading').style.display = 'none';
            document.getElementById('manhwa-container').style.display = 'flex';

            // Mostrar los manhwas
            displayManhwas(manhwaData);
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('loading').style.display = 'none';
            // Mostrar mensaje de error
            document.getElementById('manhwa-container').innerHTML = `
<div class="col-12 text-center">
  <p class="text-danger">Hubo un problema al cargar las recomendaciones. Por favor, intenta de nuevo más tarde.</p>
</div>
`;
        }
    }

    function displayManhwas(manhwas) {
        const container = document.getElementById('manhwa-container');
        container.innerHTML = '';

        manhwas.forEach(manhwa => {
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 col-xl-3 animate__animated animate__fadeIn';
            card.innerHTML = `
<div class="card h-100" data-id="${manhwa.id}">
  <div class="card-body">
    <h5 class="card-title">${manhwa.title}</h5>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <span class="genre-tag">${Array.isArray(manhwa.genre) ? manhwa.genre.join(', ') : manhwa.genre}</span>
      <small class="text-secondary">
        <i class="bi bi-star-fill text-warning me-1"></i>${manhwa.rating}
      </small>
    </div>
    <p class="card-text small text-secondary">${manhwa.synopsis.substring(0, 100)}...</p>
  </div>
</div>
`;
            container.appendChild(card);
        });

        // Añadir evento click a las tarjetas
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                showManhwaDetails(id);
            });
        });
    }

    function showManhwaDetails(id) {
        try {
            // Cargar todo el archivo JSON de nuevo (en una aplicación real podrías cachear esto)
            fetch(JSON_FILE_PATH)
                .then(response => {
                    if (!response.ok) throw new Error('No se pudo cargar el detalle');
                    return response.json();
                })
                .then(data => {
                    // Encontrar el manhwa por ID
                    const manhwas = data.manhwas || data;
                    const manhwa = manhwas.find(m => m.id === id);
                    
                    if (!manhwa) {
                        throw new Error('Manhwa no encontrado');
                    }

                    // Actualizar el modal con los detalles
                    document.getElementById('detail-title').textContent = manhwa.title;
                    document.getElementById('detail-genre').textContent = Array.isArray(manhwa.genre) ? manhwa.genre.join(', ') : manhwa.genre;
                    document.getElementById('detail-rating').textContent = manhwa.rating + '/5.0';
                    document.getElementById('detail-year').textContent = manhwa.year;
                    document.getElementById('detail-synopsis').textContent = manhwa.synopsis;

                    // Mostrar el modal
                    document.getElementById('detail-overlay').style.display = 'flex';
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('No se pudo cargar el detalle de este manhwa');
                });
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo cargar el detalle de este manhwa');
        }
    }

    // Función para filtrar manhwas por género
    async function filterManhwas(genre) {
        try {
            // Mostrar indicador de carga
            document.getElementById('loading').style.display = 'block';
            document.getElementById('manhwa-container').style.display = 'none';

            // Cargar todo el archivo JSON
            const response = await fetch(JSON_FILE_PATH);
            if (!response.ok) throw new Error('Error al filtrar');

            const data = await response.json();
            let manhwas = data.manhwas || data;

            // Aplicar filtro si no es "all"
            if (genre !== 'all') {
                manhwas = manhwas.filter(m => {
                    if (Array.isArray(m.genre)) {
                        return m.genre.includes(genre);
                    } else {
                        return m.genre === genre;
                    }
                });
            }

            // Ocultar indicador de carga
            document.getElementById('loading').style.display = 'none';
            document.getElementById('manhwa-container').style.display = 'flex';

            // Mostrar los manhwas filtrados
            displayManhwas(manhwas);
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('loading').style.display = 'none';
            document.getElementById('manhwa-container').innerHTML = `
<div class="col-12 text-center">
  <p class="text-danger">Hubo un problema al filtrar. Por favor, intenta de nuevo.</p>
</div>
`;
        }
    }

    // Inicializar los filtros
    function initFilters() {
        const filterChips = document.querySelectorAll('.filter-chip');

        // Cargar filtro guardado
        const savedFilter = localStorage.getItem('selectedGenre') || 'all';
        filterChips.forEach(chip => {
            if (chip.getAttribute('data-genre') === savedFilter) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        // Aplicar filtro guardado
        filterManhwas(savedFilter);

        // Añadir evento click a los chips de filtro
        filterChips.forEach(chip => {
            chip.addEventListener('click', function () {
                const genre = this.getAttribute('data-genre');

                // Actualizar estado activo
                filterChips.forEach(c => c.classList.remove('active'));
                this.classList.add('active');

                // Guardar en localStorage
                localStorage.setItem('selectedGenre', genre);

                // Aplicar filtro
                filterManhwas(genre);
            });
        });
    }

    // Evento para cerrar el modal de detalles
    document.getElementById('close-detail').addEventListener('click', function () {
        document.getElementById('detail-overlay').style.display = 'none';
    });

    // Cerrar el modal al hacer clic fuera del contenido
    document.getElementById('detail-overlay').addEventListener('click', function (e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

    // Inicializar la aplicación
    initFilters();

    // Add this snippet at the end of your DOMContentLoaded callback:
    const PrivBtn = document.getElementById('privaty-btn');
    const aboutOverlay = document.getElementById('about-overlay');
    const closeAbout = document.getElementById('close-about');

    function showAboutOverlay() {
        aboutOverlay.style.display = 'flex';
    }

    if (PrivBtn) {
        PrivBtn.addEventListener('click', showAboutOverlay);
    }

    closeAbout.addEventListener('click', function () {
        aboutOverlay.style.display = 'none';
    });

    // also allow clicking outside content to close
    aboutOverlay.addEventListener('click', function (e) {
        if (e.target === aboutOverlay) {
            aboutOverlay.style.display = 'none';
        }
    });
});