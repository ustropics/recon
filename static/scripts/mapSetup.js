// mapSetup.js
function initializeMap() {
    window.map = L.map('map').setView([24.8, -87.8], 7);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
    }).addTo(window.map);
    console.log('Map initialized:', window.map);
}

// Call immediately
initializeMap();