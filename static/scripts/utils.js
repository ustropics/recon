// Function to convert knots to mph
function knotsToMph(knots) {
    return knots * 1.15078;
}

// Function to determine color based on wind speed (in mph)
function getWindSpeedColor(windSpeedMph) {
    if (windSpeedMph >= 157.5) return '#ed098e'; // Category 5
    if (windSpeedMph >= 130) return '#602778';   // Category 4
    if (windSpeedMph >= 111) return '#f43445';   // Category 3
    if (windSpeedMph >= 96) return '#ff8a02';    // Category 2
    if (windSpeedMph >= 74) return '#fad716';    // Category 1
    if (windSpeedMph >= 39) return '#00ba73';    // Tropical Storm
    return '#02418b';                            // Below Tropical Storm
}