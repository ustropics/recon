// stormData.js

// Flag to track if the page has loaded initially
let hasLoadedInitially = false;

function knotsToMph(knots) {
    return knots * 1.15078;
}

const colorSchemes = {
    wind_speed: [
        { min: 157.5, color: '#ed098e', label: 'Cat 5 (157.5+ mph)' },
        { min: 130, color: '#602778', label: 'Cat 4 (130-157 mph)' },
        { min: 111, color: '#f43445', label: 'Cat 3 (111-129 mph)' },
        { min: 96, color: '#ff8a02', label: 'Cat 2 (96-110 mph)' },
        { min: 74, color: '#fad716', label: 'Cat 1 (74-95 mph)' },
        { min: 39, color: '#00ba73', label: 'Tropical Storm (39-73 mph)' },
        { min: 0, color: '#02418b', label: 'Below TS (<39 mph)' }
    ],
    pressure: [
        { min: Infinity, max: 920, color: '#ed098e', label: '<920 hPa (Extreme)' },
        { min: 920, max: 944, color: '#602778', label: '920-944 hPa (Cat 4+)' },
        { min: 944, max: 965, color: '#f43445', label: '944-965 hPa (Cat 3)' },
        { min: 965, max: 980, color: '#ff8a02', label: '965-980 hPa (Cat 2)' },
        { min: 980, max: 995, color: '#fad716', label: '980-995 hPa (Cat 1)' },
        { min: 995, max: 1010, color: '#00ba73', label: '995-1010 hPa (TS)' },
        { min: 1010, max: Infinity, color: '#02418b', label: '>1010 hPa (Weak)' }
    ],
    latent_heat_flux: [
        { min: 400, color: '#ed098e', label: '>400 W/m² (Extreme)' },
        { min: 300, color: '#602778', label: '300-400 W/m² (Very High)' },
        { min: 200, color: '#f43445', label: '200-300 W/m² (High)' },
        { min: 100, color: '#ff8a02', label: '100-200 W/m² (Moderate)' },
        { min: 50, color: '#fad716', label: '50-100 W/m² (Low)' },
        { min: 25, color: '#00ba73', label: '25-50 W/m² (Very Low)' },
        { min: 0, color: '#02418b', label: '<25 W/m² (Minimal)' }
    ],
    sensible_heat_flux: [
        { min: 200, color: '#ed098e', label: '>200 W/m² (Extreme)' },
        { min: 150, color: '#602778', label: '150-200 W/m² (Very High)' },
        { min: 100, color: '#f43445', label: '100-150 W/m² (High)' },
        { min: 50, color: '#ff8a02', label: '50-100 W/m² (Moderate)' },
        { min: 25, color: '#fad716', label: '25-50 W/m² (Low)' },
        { min: 10, color: '#00ba73', label: '10-25 W/m² (Very Low)' },
        { min: 0, color: '#02418b', label: '<10 W/m² (Minimal)' }
    ]
};

function getMeasurementColor(value, measurementType) {
    const scheme = colorSchemes[measurementType] || colorSchemes.wind_speed;
    for (const range of scheme) {
        if (measurementType === 'wind_speed' && value >= range.min) {
            return range.color;
        } else if (measurementType === 'pressure' && value >= range.min && value < range.max) {
            return range.color;
        } else if ((measurementType === 'latent_heat_flux' || measurementType === 'sensible_heat_flux') && value >= range.min) {
            return range.color;
        }
    }
    return scheme[scheme.length - 1].color;
}

function updateLegend(measurementType) {
    const legendContent = document.getElementById('legend-content');
    if (!legendContent) return;

    const scheme = colorSchemes[measurementType] || colorSchemes.wind_speed;
    const title = {
        'wind_speed': 'Wind Speed',
        'pressure': 'Pressure',
        'latent_heat_flux': 'Latent Heat Flux',
        'sensible_heat_flux': 'Sensible Heat Flux'
    }[measurementType] || 'Wind Speed';

    legendContent.innerHTML = `
        <div class="legend-header">Storm Controls</div>
        <select id="measurement-dropdown" class="material-dropdown">
            <option value="wind_speed" ${measurementType === 'wind_speed' ? 'selected' : ''}>Wind Speed</option>
            <option value="pressure" ${measurementType === 'pressure' ? 'selected' : ''}>Pressure</option>
            <option value="latent_heat_flux" ${measurementType === 'latent_heat_flux' ? 'selected' : ''}>Latent Heat Flux (Total)</option>
            <option value="sensible_heat_flux" ${measurementType === 'sensible_heat_flux' ? 'selected' : ''}>Sensible Heat Flux (Total)</option>
        </select>
        <h3>${title} Legend</h3>
        ${scheme.map(item => `<div><span style="background: ${item.color}"></span> ${item.label}</div>`).join('')}
    `;

    const measurementDropdown = document.getElementById('measurement-dropdown');
    measurementDropdown.addEventListener('change', handleMeasurementChange);
}

function handleMeasurementChange() {
    const measurementType = this.value;
    const secondaryDropdown = document.getElementById('secondary-dropdown');
    const selectedFile = secondaryDropdown.value;
    if (selectedFile) {
        console.log('Measurement type changed to:', measurementType, 'reloading:', selectedFile);
        loadStormData(selectedFile);
    } else {
        console.warn('No mission selected to reload with new measurement type');
        updateLegend(measurementType);
    }
}

function loadStormData(filePath) {
    if (!window.map) {
        console.error('Map not initialized yet! Cannot load storm data.');
        return;
    }

    const measurementType = document.getElementById('measurement-dropdown')?.value || 'wind_speed';
    console.log('Loading storm data from:', filePath, 'with measurement:', measurementType);

    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            console.log('Storm data loaded:', data);
            const stormData = Array.isArray(data) ? data : [data];
            let firstMarker = null; // To store the first marker for auto-opening

            window.map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    window.map.removeLayer(layer);
                }
            });

            window.map.off('popupopen');

            stormData.forEach((entry, index) => {
                console.log(`Processing entry ${index}:`, entry);
                if (!entry || !entry.basic_info || !entry.basic_info.lat || !entry.basic_info.lon) {
                    console.warn(`Skipping invalid entry ${index}:`, entry);
                    return;
                }

                const lat = entry.basic_info.lat;
                const lon = -Math.abs(entry.basic_info.lon);
                const windDir = entry.levels && entry.levels.length > 0 ? parseInt(entry.levels[0].wind_dir) : 0;
                const windSpdKnots = entry.levels && entry.levels.length > 0 ? parseInt(entry.levels[0].wind_spd) : 0;
                const windSpdMph = knotsToMph(windSpdKnots);
                const pressure = entry.levels && entry.levels.length > 0 ? parseFloat(entry.levels[0].pressure) : 1013;
                const latentHeatFlux = entry.levels && entry.levels.length > 0 ? parseFloat(entry.levels[0].latent_heat_flux) || 0 : 0;
                const sensibleHeatFlux = entry.levels && entry.levels.length > 0 ? parseFloat(entry.levels[0].sensible_heat_flux) || 0 : 0;

                const value = {
                    'wind_speed': windSpdMph,
                    'pressure': pressure,
                    'latent_heat_flux': latentHeatFlux,
                    'sensible_heat_flux': sensibleHeatFlux
                }[measurementType];
                const arrowColor = getMeasurementColor(value, measurementType);

                const popupContent = generatePopupContent(entry, windSpdMph, arrowColor);

                const arrowIcon = L.divIcon({
                    className: 'custom-arrow',
                    html: `<div style="transform: rotate(${windDir - 90}deg); font-size: 24px; color: ${arrowColor};">➤</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                const marker = L.marker([lat, lon], { icon: arrowIcon }).addTo(window.map)
                    .bindPopup(popupContent, {
                        maxWidth: 500,
                        maxHeight: 400,
                        className: 'custom-popup'
                    });

                // Store the first valid marker only if this is the initial load
                if (index === 0 && !hasLoadedInitially) {
                    firstMarker = marker;
                }
            });

            const bounds = L.latLngBounds(stormData.map(entry => [entry.basic_info.lat, -Math.abs(entry.basic_info.lon)]));
            if (bounds.isValid()) {
                const center = bounds.getCenter();
                const fixedZoomLevel = 7;
                window.map.setView(center, fixedZoomLevel);
            }

            // Automatically open the popup for the first marker only on initial load
            if (firstMarker && !hasLoadedInitially) {
                firstMarker.openPopup();
                hasLoadedInitially = true; // Set the flag to true after the first load
            }

            window.map.on('popupopen', function(e) {
                const popupElement = e.popup._contentNode;
                const headers = popupElement.querySelectorAll('.collapsible-header');
                headers.forEach(header => {
                    header.removeEventListener('click', toggleCollapsible);
                    header.addEventListener('click', toggleCollapsible);
                });
            });

            function toggleCollapsible() {
                const section = this.parentElement;
                section.classList.toggle('active');
            }

            updateLegend(measurementType);
        })
        .catch(error => console.error('Error loading JSON:', error));
}

window.loadStormData = loadStormData;