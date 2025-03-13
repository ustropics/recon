// popup.js
function generatePopupContent(entry, windSpdMph, arrowColor) {
    if (!entry || !entry.basic_info) {
        console.error('Invalid entry data:', entry);
        return '<div class="material-popup"><p>Error: Invalid data</p></div>';
    }

    const levelsContent = (Array.isArray(entry.levels) ? entry.levels : []).map(level => `
        <tr>
            <td>${level.pressure || 'N/A'}</td>
            <td>${level.height || 'N/A'}</td>
            <td>${level.temperature || 'N/A'}</td>
            <td>${level.dewpoint !== null ? level.dewpoint : 'N/A'}</td>
            <td>${level.wind_dir || 'N/A'}</td>
            <td>${level.wind_spd || 'N/A'}</td>
        </tr>
    `).join('');

    const tempLevelsContent = (Array.isArray(entry.temp_levels) ? entry.temp_levels : []).map(level => `
        <tr>
            <td>${level.pressure || 'N/A'}</td>
            <td>${level.temperature || 'N/A'}</td>
            <td>${level.dewpoint !== null ? level.dewpoint : 'N/A'}</td>
        </tr>
    `).join('');

    const windLevelsContent = (Array.isArray(entry.wind_levels) ? entry.wind_levels : []).map(level => `
        <tr>
            <td>${level.pressure || 'N/A'}</td>
            <td>${level.wind_dir || 'N/A'}</td>
            <td>${level.wind_spd || 'N/A'}</td>
        </tr>
    `).join('');

    const calcKeys = Object.keys(entry.calculations || {});
    const calcContent = calcKeys.map(key => `
        <tr>
            <td>${key}</td>
            <td>${entry.calculations[key] !== null ? entry.calculations[key].toFixed(6) : 'N/A'}</td>
        </tr>
    `).join('');

    const firstLevel = entry.levels && entry.levels.length > 0 ? entry.levels[0] : {};

    // Thumbnail data
    const thumbnails = [
        { src: `static/images/dropsonde/${entry.basic_info.storm_name}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_skewt.png`, alt: "Skew-T", header: "Skew-T" },
        { src: `static/images/dropsonde/${entry.basic_info.storm_name}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_winds.png`, alt: "Wind Profile", header: "Wind Profile" },
        { src: `static/images/dropsonde/${entry.basic_info.storm_name}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_hodograph.png`, alt: "Hodograph", header: "Hodograph" },
        { src: `static/images/dropsonde/${entry.basic_info.storm_name}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_shear.png`, alt: "Shear Profile", header: "Shear Profile" },
        { src: `static/images/dropsonde/${entry.basic_info.storm_name}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_theta.png`, alt: "Thermodynamics", header: "Theta" },
        { src: `static/images/dropsonde/${entry.basic_info.storm_name}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_mflux.png`, alt: "Moisture Flux", header: "Moisture Flux" }
    ];

    const itemsPerPage = 3;
    const totalPages = Math.ceil(thumbnails.length / itemsPerPage);

    // Generate page number buttons
    const pageButtons = Array.from({ length: totalPages }, (_, i) => `
        <button class="carousel-page-btn ${i === 0 ? 'active' : ''}" 
                onclick="goToPage(${i}, this.closest('.thumbnail-carousel'))">${i + 1}</button>
    `).join('');

    return `
        <div class="material-popup">
            <div class="popup-header">
                <div class="header-img" style="background-color: ${arrowColor}">
                    <h3>${entry.basic_info.storm_name || 'Unknown'}</h3>
                    <p>${entry.basic_info.storm_type || 'Unknown'}</p>
                    <p>Mission #${entry.basic_info.mission_id || 'N/A'}</p>
                    <p>Obs #${entry.basic_info.observation_id || 'N/A'}</p>
                </div>
                <div class="header-info">
                    <div class="popup-row">
                        <span>Plane</span>
                        <span>${entry.basic_info.plane_id || 'N/A'}</span>
                    </div>
                    <div class="popup-row">
                        <span>Coordinates</span>
                        <span>${entry.basic_info.lat || 'N/A'}N, -${entry.basic_info.lon || 'N/A'}W</span>
                    </div>
                    <div class="popup-row">
                        <span>Date/Time</span>
                        <span>${entry.basic_info.year || 'N/A'}-${entry.basic_info.month || 'N/A'}-${entry.basic_info.day || 'N/A'} at ${(entry.basic_info.time ? entry.basic_info.time.slice(0, 2) + ':' + entry.basic_info.time.slice(2) : 'N/A')}
</span>
                    </div>
                </div>
            </div>
            
            <div class="thumbnail-carousel" data-storm="${entry.basic_info.storm_name}" data-year="${entry.basic_info.year}" data-mission="${entry.basic_info.mission_id}" data-obs="${entry.basic_info.observation_id}">
                <div class="thumbnail-row" data-index="0">
                    ${thumbnails.slice(0, 3).map(thumb => `
                        <div style="position: relative;">
                            <img src="${thumb.src}" 
                                 alt="${thumb.alt}" 
                                 class="thumbnail" 
                                 onclick="showImagePopup(this.src, '${entry.basic_info.storm_name}', '${entry.basic_info.year}', '${entry.basic_info.mission_id}', '${entry.basic_info.observation_id}')">
                            <div class="thumbnail-header">${thumb.header}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="carousel-controls">
                    <button class="carousel-arrow left-arrow" onclick="moveCarousel(-1, this.closest('.thumbnail-carousel'))">◄</button>
                    ${pageButtons}
                    <button class="carousel-arrow right-arrow" onclick="moveCarousel(1, this.closest('.thumbnail-carousel'))">►</button>
                </div>
            </div>

            <div class="popup-section">
                <h4>Surface Information</h4>
                <div class="popup-row">
                    <span>Pressure</span>
                    <span>${firstLevel.pressure || 'N/A'} hPa</span>
                </div>
                <div class="popup-row">
                    <span>Sea Surface Temperature</span>
                    <span>${entry.basic_info.sst_value || 'N/A'}°C</span>
                </div>
                <div class="popup-row">
                    <span>Air Temperature</span>
                    <span>${firstLevel.temperature || 'N/A'}°C</span>
                </div>
                <div class="popup-row">
                    <span>Dewpoint</span>
                    <span>${firstLevel.dewpoint !== null ? firstLevel.dewpoint : 'N/A'}°C</span>
                </div>
                <div class="popup-row">
                    <span>Wind Speed</span>
                    <span>${firstLevel.wind_spd || 'N/A'} knots</span>
                </div>
                <div class="popup-row">
                    <span>Wind Direction</span>
                    <span>${firstLevel.wind_dir || 'N/A'}°</span>
                </div>
            </div>

            <div class="popup-section collapsible">
                <h4 class="collapsible-header">Main Levels (${(Array.isArray(entry.levels) ? entry.levels : []).length})</h4>
                <div class="collapsible-content">
                    <table>
                        <thead>
                            <tr>
                                <th>Pressure (hPa)</th>
                                <th>Height (m)</th>
                                <th>Temp (°C)</th>
                                <th>Dewpoint (°C)</th>
                                <th>Wind Dir (°)</th>
                                <th>Wind Spd (knots)</th>
                            </tr>
                        </thead>
                        <tbody>${levelsContent}</tbody>
                    </table>
                </div>
            </div>

            <div class="popup-section collapsible">
                <h4 class="collapsible-header">Temperature Levels (${(Array.isArray(entry.temp_levels) ? entry.temp_levels : []).length})</h4>
                <div class="collapsible-content">
                    <table>
                        <thead>
                            <tr>
                                <th>Pressure (hPa)</th>
                                <th>Temp (°C)</th>
                                <th>Dewpoint (°C)</th>
                            </tr>
                        </thead>
                        <tbody>${tempLevelsContent}</tbody>
                    </table>
                </div>
            </div>

            <div class="popup-section collapsible">
                <h4 class="collapsible-header">Wind Levels (${(Array.isArray(entry.wind_levels) ? entry.wind_levels : []).length})</h4>
                <div class="collapsible-content">
                    <table>
                        <thead>
                            <tr>
                                <th>Pressure (hPa)</th>
                                <th>Wind Dir (°)</th>
                                <th>Wind Spd (knots)</th>
                            </tr>
                        </thead>
                        <tbody>${windLevelsContent}</tbody>
                    </table>
                </div>
            </div>

            <div class="popup-section collapsible">
                <h4 class="collapsible-header">Calculations (${calcKeys.length})</h4>
                <div class="collapsible-content">
                    <table>
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>${calcContent}</tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function moveCarousel(direction, carousel) {
    const stormName = carousel.getAttribute('data-storm');
    const year = carousel.getAttribute('data-year');
    const missionId = carousel.getAttribute('data-mission');
    const observationId = carousel.getAttribute('data-obs');

    const thumbnails = [
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_skewt.png`, alt: "Skew-T Diagram", header: "Skew-T Diagram" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_winds.png`, alt: "Wind Profile", header: "Wind Profile" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_hodograph.png`, alt: "Hodograph", header: "Hodograph" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_shear.png`, alt: "Shear Profile", header: "Shear Profile" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_theta.png`, alt: "Thermodynamics", header: "Thermodynamics" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_mflux.png`, alt: "Moisture Flux", header: "Moisture Flux" }
    ];

    const row = carousel.querySelector('.thumbnail-row');
    const pageButtons = carousel.querySelectorAll('.carousel-page-btn');
    let index = parseInt(row.getAttribute('data-index'));
    const itemsPerPage = 3;
    const totalPages = Math.ceil(thumbnails.length / itemsPerPage);

    index = (index + direction + totalPages) % totalPages;
    row.setAttribute('data-index', index);

    const start = index * itemsPerPage;
    const end = start + itemsPerPage;
    row.innerHTML = thumbnails.slice(start, end).map(thumb => `
        <div style="position: relative;">
            <img src="${thumb.src}" 
                 alt="${thumb.alt}" 
                 class="thumbnail" 
                 onclick="showImagePopup(this.src, '${stormName}', '${year}', '${missionId}', '${observationId}')">
            <div class="thumbnail-header">${thumb.header}</div>
        </div>
    `).join('');

    // Update active page button
    pageButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

function goToPage(pageIndex, carousel) {
    const stormName = carousel.getAttribute('data-storm');
    const year = carousel.getAttribute('data-year');
    const missionId = carousel.getAttribute('data-mission');
    const observationId = carousel.getAttribute('data-obs');

    const thumbnails = [
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_skewt.png`, alt: "Skew-T Diagram", header: "Skew-T Diagram" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_winds.png`, alt: "Wind Profile", header: "Wind Profile" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_hodograph.png`, alt: "Hodograph", header: "Hodograph" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_shear.png`, alt: "Shear Profile", header: "Shear Profile" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_theta.png`, alt: "Thermodynamics", header: "Thermodynamics" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_mflux.png`, alt: "Moisture Flux", header: "Moisture Flux" }
    ];

    const row = carousel.querySelector('.thumbnail-row');
    const pageButtons = carousel.querySelectorAll('.carousel-page-btn');
    const itemsPerPage = 3;

    row.setAttribute('data-index', pageIndex);
    const start = pageIndex * itemsPerPage;
    const end = start + itemsPerPage;
    row.innerHTML = thumbnails.slice(start, end).map(thumb => `
        <div style="position: relative;">
            <img src="${thumb.src}" 
                 alt="${thumb.alt}" 
                 class="thumbnail" 
                 onclick="showImagePopup(this.src, '${stormName}', '${year}', '${missionId}', '${observationId}')">
            <div class="thumbnail-header">${thumb.header}</div>
        </div>
    `).join('');

    // Update active page button
    pageButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === pageIndex);
    });
}

function showImagePopup(initialSrc, stormName, year, missionId, observationId) {
    const imageSources = [
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_skewt.png`,
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_winds.png`,
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_hodograph.png`,
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_shear.png`,
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_theta.png`,
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_mflux.png`
    ];

    const popup = document.createElement('div');
    popup.className = 'image-popup-overlay';
    popup.style.opacity = '0';
    
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    
    const mainImg = document.createElement('img');
    mainImg.src = initialSrc;
    mainImg.className = 'popup-image';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'popup-close-btn';
    
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.className = 'popup-thumbnail-container';
    
    imageSources.forEach(src => {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.className = 'popup-thumbnail';
        thumb.onclick = () => {
            mainImg.style.opacity = '0';
            setTimeout(() => {
                mainImg.src = src;
                mainImg.style.opacity = '1';
            }, 300);
        };
        thumbnailContainer.appendChild(thumb);
    });

    imageContainer.appendChild(mainImg);
    imageContainer.appendChild(thumbnailContainer);
    popup.appendChild(imageContainer);
    popup.appendChild(closeBtn);
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.style.opacity = '1';
    }, 10);

    const closePopup = () => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    };
    
    closeBtn.onclick = closePopup;
    popup.onclick = (e) => {
        if (e.target === popup) {
            closePopup();
        }
    };

    document.querySelector('.material-popup').addEventListener('DOMNodeInserted', () => {
        console.log('Popup width:', document.querySelector('.material-popup').offsetWidth);
        console.log('Carousel width:', document.querySelector('.thumbnail-carousel').offsetWidth);
        console.log('Thumbnail row width:', document.querySelector('.thumbnail-row').offsetWidth);
    }, { once: true });
}