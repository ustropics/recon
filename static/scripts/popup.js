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

    const calcLabels = {
        "H_L_int": { label: "H<sub>L,int</sub>", desc: "Latent heat flux (interface)", unit: "W/m²" },
        "Q_L": { label: "Q<sub>L</sub>", desc: "Sea spray-induced latent heat flux", unit: "W/m²" },
        "H_L_total": { label: "H<sub>L,total</sub>", desc: "Total latent heat flux", unit: "W/m²" },
        "H_S_int": { label: "H<sub>S,int</sub>", desc: "Sensible heat flux (interface)", unit: "W/m²" },
        "Q_S": { label: "Q<sub>S</sub>", desc: "Sea spray-induced sensible heat flux", unit: "W/m²" },
        "H_S_total": { label: "H<sub>S,total</sub>", desc: "Total sensible heat flux", unit: "W/m²" },
        "rho_a": { label: "ρ<sub>a</sub>", desc: "Air density", unit: "kg/m³" },
        "es_Ts": { label: "e<sub>s</sub>(T<sub>s</sub>)", desc: "Saturation vapor pressure at SST", unit: "hPa" },
        "qs": { label: "q<sub>s</sub>", desc: "Specific humidity at surface", unit: "kg/kg" },
        "ea_Td": { label: "e<sub>a</sub>(T<sub>d</sub>)", desc: "Vapor pressure at dewpoint temperature", unit: "hPa" },
        "q": { label: "q", desc: "Specific humidity", unit: "kg/kg" },
        "ea_Ta": { label: "e<sub>a</sub>(T<sub>a</sub>)", desc: "Vapor pressure at air temperature", unit: "hPa" },
        "qa": { label: "q<sub>a</sub>", desc: "Specific humidity at air", unit: "kg/kg" },
        "W": { label: "W", desc: "Whitecap fraction", unit: "" },
        "lambda_h": { label: "λ<sub>h</sub>", desc: "Scale height for spray layer", unit: "" },
        "beta": { label: "β", desc: "Beta parameter", unit: "" },
        "C_E": { label: "C<sub>E</sub>", desc: "Exchange coefficient", unit: "" }
    };

    const calcOrder = [
        "H_L_int", "Q_L", "H_L_total", "H_S_int", "Q_S", "H_S_total",
        "rho_a", "es_Ts", "ea_Td", "ea_Ta", "q", "qs", "qa", "W", "lambda_h", "beta", "C_E",
    ];

    function formatNumber(value) {
        if (value === null) return 'N/A';
        const absValue = Math.abs(value);
        if (absValue < 0.01 && absValue > 0) {
            return value.toExponential(2);
        }
        return value.toFixed(2);
    }

    const calcContent = calcOrder
        .filter(key => entry.calculations && key in entry.calculations)
        .map(key => `
            <tr>
                <td>${calcLabels[key] ? `${calcLabels[key].desc} [ ${calcLabels[key].label} ]` : key}</td>
                <td>${entry.calculations[key] !== null ? `${formatNumber(entry.calculations[key])} ${calcLabels[key].unit}` : 'N/A'}</td>
            </tr>
        `).join('');

    const firstLevel = entry.levels && entry.levels.length > 0 ? entry.levels[0] : {};
    const stormName = entry.basic_info.storm_name.charAt(0).toUpperCase() + 
                     entry.basic_info.storm_name.slice(1).toLowerCase();

    const thumbnails = [
        { src: `static/images/dropsonde/${stormName}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_wind_profile.webp`, alt: "10m Wind Corr.", header: "10m Wind Corr." },
        { src: `static/images/dropsonde/${stormName}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_skewt.webp`, alt: "Skew-T", header: "Skew-T" },
        { src: `static/images/dropsonde/${stormName}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_winds.webp`, alt: "Wind Profile", header: "Wind Profile" },
        { src: `static/images/dropsonde/${stormName}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_hodograph.webp`, alt: "Hodograph", header: "Hodograph" },
        { src: `static/images/dropsonde/${stormName}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_shear.webp`, alt: "Shear Profile", header: "Shear Profile" },
        { src: `static/images/dropsonde/${stormName}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_theta.webp`, alt: "Thermodynamics", header: "Theta" },
        { src: `static/images/dropsonde/${stormName}${entry.basic_info.year}/${entry.basic_info.mission_id}${entry.basic_info.observation_id}_mflux.webp`, alt: "Moisture Flux", header: "Moisture Flux" }
    ];

    const itemsPerPage = 3;
    const totalPages = Math.ceil(thumbnails.length / itemsPerPage);

    const pageButtons = Array.from({ length: totalPages }, (_, i) => `
        <button class="carousel-page-btn ${i === 0 ? 'active' : ''}" 
                onclick="goToPage(${i}, this.closest('.thumbnail-carousel'))">${i + 1}</button>
    `).join('');

    return `
        <div class="material-popup">
            <div class="popup-header">
                <div class="header-img" style="background-color: ${arrowColor}">
                    <h3>${stormName}</h3>
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
                        <span>${entry.basic_info.year || 'N/A'}-${entry.basic_info.month || 'N/A'}-${entry.basic_info.day || 'N/A'} at ${(entry.basic_info.time ? entry.basic_info.time.slice(0, 2) + ':' + entry.basic_info.time.slice(2) : 'N/A')}</span>
                    </div>
                </div>
            </div>
            
            <div class="thumbnail-carousel" data-storm="${stormName}" data-year="${entry.basic_info.year}" data-mission="${entry.basic_info.mission_id}" data-obs="${entry.basic_info.observation_id}">
                <div class="thumbnail-row" data-index="0">
                    ${thumbnails.slice(0, 3).map(thumb => `
                        <div style="position: relative;">
                            <img src="${thumb.src}" 
                                 alt="${thumb.alt}" 
                                 class="thumbnail" 
                                 onclick="showImagePopup(this.src, '${stormName}', '${entry.basic_info.year}', '${entry.basic_info.mission_id}', '${entry.basic_info.observation_id}')">
                            <div class="thumbnail-header">${thumb.header}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="carousel-controls">
                    <button class="carousel-arrow left-arrow" onclick="moveCarousel(-1, this.closest('.thumbnail-carousel'))"><span class="material-icons">arrow_back</span></button>
                    ${pageButtons}
                    <button class="carousel-arrow right-arrow" onclick="moveCarousel(1, this.closest('.thumbnail-carousel'))"><span class="material-icons">arrow_forward</span></button>
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
                <h4 class="collapsible-header">Calculations (${calcOrder.filter(key => entry.calculations && key in entry.calculations).length})</h4>
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
                    <div class="popup-buttons">
                        <button class="material-btn" onclick="saveJSON('${stormName}', '${entry.basic_info.year}', '${entry.basic_info.mission_id}', '${entry.basic_info.observation_id}', ${JSON.stringify(entry)})">Save JSON</button>
                        <button class="material-btn" onclick="saveImages('${stormName}', '${entry.basic_info.year}', '${entry.basic_info.mission_id}', '${entry.basic_info.observation_id}')">Save Images</button>
                    </div>
            </div>
        </div>
    `;
}

// Add save functions
function saveJSON(stormName, year, missionId, observationId, entry) {
    const jsonString = JSON.stringify(entry, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stormName}_${year}_Mission${missionId}_Obs${observationId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function saveImages(stormName, year, missionId, observationId) {
    const imageUrls = [
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_wind_profile.webp`,
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_skewt.webp`,
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_winds.webp`,
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_hodograph.webp`,
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_shear.webp`,
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_theta.webp`,
        `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_mflux.webp`
    ];

    imageUrls.forEach((url, index) => {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                return response.blob();
            })
            .then(blob => {
                const a = document.createElement('a');
                const objectUrl = URL.createObjectURL(blob);
                a.href = objectUrl;
                a.download = `${stormName}_${year}_Mission${missionId}_Obs${observationId}_${index + 1}.webp`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(objectUrl);
            })
            .catch(error => console.error('Error downloading image:', error));
    });
}

// Rest of the file (moveCarousel, goToPage, showImagePopup) remains unchanged
function moveCarousel(direction, carousel) {
    const stormName = carousel.getAttribute('data-storm').charAt(0).toUpperCase() + 
                     carousel.getAttribute('data-storm').slice(1).toLowerCase();
    const year = carousel.getAttribute('data-year');
    const missionId = carousel.getAttribute('data-mission');
    const observationId = carousel.getAttribute('data-obs');

    const thumbnails = [
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_wind_profile.webp`, alt: "10m Wind Corr.", header: "10m Wind Corr." },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_skewt.webp`, alt: "Skew-T Diagram", header: "Skew-T Diagram" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_winds.webp`, alt: "Wind Profile", header: "Wind Profile" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_hodograph.webp`, alt: "Hodograph", header: "Hodograph" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_shear.webp`, alt: "Shear Profile", header: "Shear Profile" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_theta.webp`, alt: "Thermodynamics", header: "Thermodynamics" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_mflux.webp`, alt: "Moisture Flux", header: "Moisture Flux" }
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

    pageButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

function goToPage(pageIndex, carousel) {
    const stormName = carousel.getAttribute('data-storm').charAt(0).toUpperCase() + 
                     carousel.getAttribute('data-storm').slice(1).toLowerCase();
    const year = carousel.getAttribute('data-year');
    const missionId = carousel.getAttribute('data-mission');
    const observationId = carousel.getAttribute('data-obs');

    const thumbnails = [
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_wind_profile.webp`, alt: "10m Wind Corr.", header: "10m Wind Corr." },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_skewt.webp`, alt: "Skew-T Diagram", header: "Skew-T Diagram" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_winds.webp`, alt: "Wind Profile", header: "Wind Profile" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_hodograph.webp`, alt: "Hodograph", header: "Hodograph" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_shear.webp`, alt: "Shear Profile", header: "Shear Profile" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_theta.webp`, alt: "Thermodynamics", header: "Thermodynamics" },
        { src: `static/images/dropsonde/${stormName}${year}/${missionId}${observationId}_mflux.webp`, alt: "Moisture Flux", header: "Moisture Flux" }
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

    pageButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === pageIndex);
    });
}

function showImagePopup(initialSrc, stormName, year, missionId, observationId) {
    const formattedStormName = stormName.charAt(0).toUpperCase() + stormName.slice(1).toLowerCase();
    const imageSources = [
        `static/images/dropsonde/${formattedStormName}${year}/${missionId}${observationId}_wind_profile.webp`,
        `static/images/dropsonde/${formattedStormName}${year}/${missionId}${observationId}_skewt.webp`,
        `static/images/dropsonde/${formattedStormName}${year}/${missionId}${observationId}_winds.webp`,
        `static/images/dropsonde/${formattedStormName}${year}/${missionId}${observationId}_hodograph.webp`,
        `static/images/dropsonde/${formattedStormName}${year}/${missionId}${observationId}_shear.webp`,
        `static/images/dropsonde/${formattedStormName}${year}/${missionId}${observationId}_theta.webp`,
        `static/images/dropsonde/${formattedStormName}${year}/${missionId}${observationId}_mflux.webp`
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
}