// Script principal para cargar personajes de Haikyuu!!
// Usa la API pública de Jikan (https://jikan.moe)

const BASE_URL = 'https://api.jikan.moe/v4';

// Selecciono los elementos del DOM que voy a necesitar
const loadBtn = document.getElementById('loadBtn');
const statusArea = document.getElementById('statusArea');
const charactersGrid = document.getElementById('charactersGrid');
const counter = document.getElementById('counter');
const counterNum = document.getElementById('counterNum');

// Evento del botón - cuando  hace clic empieza todo
loadBtn.addEventListener('click', async () => {
    //  para que no se pueda hacer doble clic
    loadBtn.disabled = true;
    loadBtn.querySelector('.btn-text').textContent = 'Cargando…';

    // Limpio lo que hubiera antes
    charactersGrid.innerHTML = '';
    counter.hidden = true;

    mostrarCargando();

    try {
        // Primero busco el anime para conseguir su ID
        const animeId = await getAnimeId();

        // Con el ID ya puedo pedir los personajes
        const personajes = await getPersonajes(animeId);

        renderPersonajes(personajes);

    } catch (error) {
        mostrarError(error.message);
    } finally {
        loadBtn.disabled = false;
        loadBtn.querySelector('.btn-text').textContent = 'Recargar';
    }
});

// Busca el anime en la API y retorna el ID (mal_id)
async function getAnimeId() {
    const res = await fetch(`${BASE_URL}/anime?q=haikyuu&limit=1`);

    if (!res.ok) {
        throw new Error(`No se pudo conectar con la API. Código: ${res.status}`);
    }

    const data = await res.json();

    if (!data.data || data.data.length === 0) {
        throw new Error('No se encontró el anime en la búsqueda.');
    }

    // Me quedo con el primer resultado que aparece
    const anime = data.data[0];
    return anime.mal_id;
}

// Con el ID del anime pido la lista de personajes
async function getPersonajes(animeId) {
    const res = await fetch(`${BASE_URL}/anime/${animeId}/characters`);

    if (!res.ok) {
        throw new Error(`Error al traer los personajes. Código: ${res.status}`);
    }

    const data = await res.json();

    if (!data.data || data.data.length === 0) {
        throw new Error('No se encontraron personajes para este anime.');
    }

    // Solo muestro 30 personajes máximo
    return data.data.slice(0, 30);
}

// Recibe el arreglo de personajes y crea las tarjetas en el DOM
function renderPersonajes(personajes) {
    statusArea.innerHTML = '';

    personajes.forEach((item, i) => {
        const card = crearCard(item, i);
        charactersGrid.appendChild(card);
    });

    // Muestro el contador con cuántos personajes cargaron
    counterNum.textContent = personajes.length;
    counter.hidden = false;
}

// Crea y retorna un elemento article (la tarjeta del personaje)
function crearCard(item, index) {
    const nombre    = item.character.name || 'Sin nombre';
    const nombreJp  = item.character.name_kanji || '';
    const imagen    = item.character.images?.jpg?.image_url || '';
    const esPrincipal = item.role === 'Main';
    const rolTexto  = esPrincipal ? 'Principal' : 'Secundario';

    const card = document.createElement('article');
    card.classList.add('char-card');

    // Le pongo un pequeño delay a cada tarjeta para que aparezcan de a poco
    card.style.animationDelay = `${Math.min(index * 40, 800)}ms`;

    // Sección de la imagen
    const imgWrap = document.createElement('div');
    imgWrap.classList.add('char-img-wrap');

    if (imagen) {
        const img = document.createElement('img');
        img.classList.add('char-img');
        img.src = imagen;
        img.alt = nombre;
        img.loading = 'lazy';

        // Si la imagen no carga muestro la inicial del nombre
        img.onerror = function () {
            imgWrap.innerHTML = `<div class="char-placeholder">${nombre.charAt(0)}</div>`;
        };

        imgWrap.appendChild(img);
    } else {
        imgWrap.innerHTML = `<div class="char-placeholder">${nombre.charAt(0)}</div>`;
    }

    // Badge que indica si es personaje principal o secundario
    const badge = document.createElement('span');
    badge.classList.add('char-role-badge', esPrincipal ? 'badge-main' : 'badge-support');
    badge.textContent = esPrincipal ? '★ Principal' : 'Secundario';
    imgWrap.appendChild(badge);

    // Sección de texto con nombre y rol
    const info = document.createElement('div');
    info.classList.add('char-info');

    info.innerHTML = `
    <h2 class="char-name">${nombre}</h2>
    <p class="char-name-jp">${nombreJp}</p>
    <div class="char-divider"></div>
    <p class="char-role">Rol: ${rolTexto}</p>
  `;

    card.appendChild(imgWrap);
    card.appendChild(info);

    return card;
}

// Muestra el spinner mientras carga
function mostrarCargando() {
    statusArea.innerHTML = `
    <div class="loading-msg">
      <div class="spinner"></div>
      <span>Buscando personajes en la cancha…</span>
    </div>
  `;
}

// Muestra el mensaje de error en pantalla (no en consola)
function mostrarError(mensaje) {
    statusArea.innerHTML = `
    <div class="error-msg">
      <strong>⚠ Ocurrió un problema</strong>
      <span>${mensaje}</span>
    </div>
  `;
}