document.addEventListener('DOMContentLoaded', function () {
    // URL de tu API (ajusta según donde la despliegues)
    const API_URL = 'http://localhost:3000';

    // Función para cargar los manhwas desde la API
    async function loadManhwas() {
        try {
            // Mostrar indicador de carga
            document.getElementById('loading').style.display = 'block';
            document.getElementById('manhwa-container').style.display = 'none';

            // Obtener datos de la API
            const response = await fetch(`${API_URL}/manhwas`);
            if (!response.ok) {
                throw new Error('Error al cargar los datos');
            }

            const manhwaData = await response.json();

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
      <span class="genre-tag">${manhwa.genre}</span>
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

    async function showManhwaDetails(id) {
        try {
            // Obtener detalles del manhwa específico
            const response = await fetch(`${API_URL}/manhwas/${id}`);
            if (!response.ok) throw new Error('No se pudo cargar el detalle');

            const manhwa = await response.json();

            // Actualizar el modal con los detalles
            document.getElementById('detail-title').textContent = manhwa.title;
            document.getElementById('detail-genre').textContent = manhwa.genre;
            document.getElementById('detail-rating').textContent = manhwa.rating + '/5.0';
            document.getElementById('detail-year').textContent = manhwa.year;
            document.getElementById('detail-synopsis').textContent = manhwa.synopsis;

            // Mostrar el modal
            document.getElementById('detail-overlay').style.display = 'flex';
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

            // Construir URL de la API con filtro
            let url = `${API_URL}/manhwas`;
            if (genre !== 'all') {
                url = `${API_URL}/manhwas?genre=${encodeURIComponent(genre)}`;
            }

            // Obtener datos filtrados
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al filtrar');

            const filteredManhwas = await response.json();

            // Ocultar indicador de carga
            document.getElementById('loading').style.display = 'none';
            document.getElementById('manhwa-container').style.display = 'flex';

            // Mostrar los manhwas filtrados
            displayManhwas(filteredManhwas);
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