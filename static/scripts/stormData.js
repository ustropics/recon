// stormData.js
function loadStormData(filePath) {
    if (!window.map) {
        console.error('Map not initialized yet! Cannot load storm data.');
        return;
    }

    console.log('Loading storm data from:', filePath);

    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            console.log('Storm data loaded:', data);
            const stormData = Array.isArray(data) ? data : [data];

            // Clear existing markers
            window.map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    window.map.removeLayer(layer);
                }
            });

            // Remove existing popupopen listeners to prevent accumulation
            window.map.off('popupopen');

            // Add new markers
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
                const arrowColor = getWindSpeedColor(windSpdMph);

                const popupContent = generatePopupContent(entry, windSpdMph, arrowColor);

                const arrowIcon = L.divIcon({
                    className: 'custom-arrow',
                    html: `<div style="transform: rotate(${windDir - 90}deg); font-size: 24px; color: ${arrowColor};">➤</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                L.marker([lat, lon], { icon: arrowIcon }).addTo(window.map)
                    .bindPopup(popupContent, {
                        maxWidth: 500,
                        maxHeight: 400,
                        className: 'custom-popup'
                    });
            });

            // Adjust map view with fixed zoom
            const bounds = L.latLngBounds(stormData.map(entry => [entry.basic_info.lat, -Math.abs(entry.basic_info.lon)]));
            if (bounds.isValid()) {
                const center = bounds.getCenter();
                const fixedZoomLevel = 7; // Set your desired zoom level here
                window.map.setView(center, fixedZoomLevel);
            }

            // Add collapsible functionality for each popup
            window.map.on('popupopen', function(e) {
                const popupElement = e.popup._contentNode; // Get the popup's DOM content
                const headers = popupElement.querySelectorAll('.collapsible-header');
                headers.forEach(header => {
                    // Remove any existing listeners to avoid duplicates
                    header.removeEventListener('click', toggleCollapsible);
                    // Add new listener
                    header.addEventListener('click', toggleCollapsible);
                });
            });

            // Define the toggle function outside the loop for reuse
            function toggleCollapsible() {
                const section = this.parentElement;
                section.classList.toggle('active');
            }
        })
        .catch(error => console.error('Error loading JSON:', error));
}