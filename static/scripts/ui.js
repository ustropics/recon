document.addEventListener('DOMContentLoaded', function() {
    const primaryDropdown = document.getElementById('primary-dropdown');
    const secondaryDropdown = document.getElementById('secondary-dropdown');
    const refreshButton = document.getElementById('refresh-data');
    const stormNameElement = document.getElementById('storm-name');
    const planeIdElement = document.getElementById('plane-id');
    const startTimeElement = document.getElementById('start-time');
    const endTimeElement = document.getElementById('end-time');
    const numObsElement = document.getElementById('num-obs');
    const coordinatesElement = document.getElementById('coordinates');

    let storms = []; // Store storm data globally

    if (!stormNameElement || !planeIdElement || !startTimeElement || !endTimeElement || !numObsElement || !coordinatesElement) {
        console.error('One or more DOM elements are missing:', {
            stormNameElement, planeIdElement, startTimeElement, endTimeElement, numObsElement, coordinatesElement
        });
        return;
    }

    function updateHeader(stormName, missionData) {
        console.log('Updating header with:', { stormName, missionData });
    
        function formatTimestamp(timestamp) {
            if (!timestamp || timestamp === "N/A") return "N/A";
            const date = new Date(timestamp.replace(/(\d{4}-\d{2}-\d{2})T(\d{2})(\d{2})/, "$1T$2:$3:00Z"));
            const options = { month: 'long', day: 'numeric', year: 'numeric' };
            const dateStr = date.toLocaleDateString('en-US', options);
            const hours = date.getUTCHours().toString().padStart(2, '0');
            const minutes = date.getUTCMinutes().toString().padStart(2, '0');
            const daySuffix = (day) => {
                if (day > 3 && day < 21) return 'th';
                switch (day % 10) {
                    case 1: return 'st';
                    case 2: return 'nd';
                    case 3: return 'rd';
                    default: return 'th';
                }
            };
            return `${dateStr.replace(/(\d+)/, `$1${daySuffix(date.getDate())}`)} at ${hours}:${minutes} UTC`;
        }
    
        if (stormNameElement) stormNameElement.textContent = missionData.mission_number ? `${stormName} (Mission #${missionData.mission_number})` : stormName || 'Storm Recon';
        if (planeIdElement) planeIdElement.textContent = missionData.plane_id ? `Plane: ${missionData.plane_id}` : 'Plane: N/A';
        if (startTimeElement) startTimeElement.textContent = missionData.start_time ? `Start: ${formatTimestamp(missionData.start_time)}` : 'Start: N/A';
        if (endTimeElement) endTimeElement.textContent = missionData.end_time ? `End: ${formatTimestamp(missionData.end_time)}` : 'End: N/A';
        if (numObsElement) numObsElement.textContent = missionData.number_of_observations !== undefined ? `${missionData.number_of_observations} observations` : '0 obs';
        if (coordinatesElement) coordinatesElement.textContent = missionData.central_coordinates && 
            missionData.central_coordinates.latitude !== undefined && 
            missionData.central_coordinates.longitude !== undefined ? 
            `Lat: ${missionData.central_coordinates.latitude.toFixed(2)}N, Lon: -${missionData.central_coordinates.longitude.toFixed(2)}W` : 
            'Lat: N/A, Lon: N/A';
    
        const missionImage = document.getElementById('mission-image');
        if (missionImage) {
            if (missionData.mission_number && stormName) {
                const year = missionData.start_time ? missionData.start_time.slice(0, 4) : 'defaultYear';
                const stormId = stormName;
                const missionId = missionData.mission_number;
                const imageUrl = `static/images/mission/${stormId}${year}/${missionId}_3dwind_lhf.png`;
                console.log('Setting mission image URL:', imageUrl);
                missionImage.src = imageUrl;
                missionImage.style.display = 'block';
                missionImage.style.cursor = 'pointer';
                // Update onclick to use current src
                missionImage.onclick = () => showMissionImagePopup(missionImage.src, stormName, year, missionId);
            } else {
                missionImage.src = '';
                missionImage.style.display = 'none';
                missionImage.onclick = null;
            }
        }
    
        updateMissionCarousel(stormName, missionData);
    }
    
    function showMissionImagePopup(initialSrc, stormName, year, missionId) {
        const imageSources = [
            { src: `static/images/mission/${stormName}${year}/${missionId}_3dwind_lhf.png`, alt: "3D Wind LHF" },
            { src: `static/images/mission/${stormName}${year}/${missionId}_3dtemp.png`, alt: "3D Temperature" },
            { src: `static/images/mission/${stormName}${year}/${missionId}_ugradP.png`, alt: "Pressure Gradient" },
            { src: `static/images/mission/${stormName}${year}/${missionId}_ugradQL.png`, alt: "Pressure Gradient", header: "Pressure" },
        ];

        const popup = document.createElement('div');
        popup.className = 'image-popup-overlay';
        popup.style.opacity = '0';

        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';

        const mainImg = document.createElement('img');
        mainImg.src = initialSrc;
        mainImg.className = 'popup-image';

        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'popup-thumbnail-container';

        imageSources.forEach(item => {
            const thumb = document.createElement('img');
            thumb.src = item.src;
            thumb.className = 'popup-thumbnail';
            thumb.alt = item.alt;
            thumb.onclick = () => {
                mainImg.style.opacity = '0';
                setTimeout(() => {
                    mainImg.src = item.src;
                    mainImg.style.opacity = '1';
                }, 300);
            };
            thumbnailContainer.appendChild(thumb);
        });

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.className = 'popup-close-btn';

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

    function updateMissionCarousel(stormName, missionData) {
        const carousel = document.getElementById('mission-carousel');
        const thumbnailRow = document.getElementById('mission-thumbnail-row');
        const controls = document.getElementById('mission-carousel-controls');
        const paginationContainer = document.getElementById('pagination-buttons');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const missionImage = document.getElementById('mission-image');

        if (!carousel || !thumbnailRow || !controls || !paginationContainer || !prevBtn || !nextBtn || !missionImage) {
            console.error('Carousel or mission image elements missing');
            return;
        }

        if (missionData.mission_number && stormName) {
            const year = missionData.start_time ? missionData.start_time.slice(0, 4) : 'defaultYear';
            const stormId = stormName.toLowerCase();
            const missionId = missionData.mission_number;

            const thumbnails = [
                { src: `static/images/mission/${stormName}${year}/${missionId}_3dwind_lhf.png`, alt: "3D Wind LHF", header: "3D Wind" },
                { src: `static/images/mission/${stormName}${year}/${missionId}_3dtemp.png`, alt: "3D Temperature", header: "3D Temp" },
                { src: `static/images/mission/${stormName}${year}/${missionId}_ugradP.png`, alt: "Pressure Gradient", header: "Pressure" },
                { src: `static/images/mission/${stormName}${year}/${missionId}_ugradQL.png`, alt: "Pressure Gradient", header: "Pressure" },
            ];

            const itemsPerPage = 3;
            const totalPages = Math.ceil(thumbnails.length / itemsPerPage);

            const initialThumbs = thumbnails.slice(0, itemsPerPage);
            thumbnailRow.style.opacity = '0';
            thumbnailRow.innerHTML = initialThumbs.map(thumb => `
                <div class="thumbnail-wrapper">
                    <img src="${thumb.src}" alt="${thumb.alt}" class="mission-thumbnail" 
                         onclick="updateMainImage('${thumb.src}')">
                    <div class="thumbnail-header">${thumb.header}</div>
                </div>
            `).join('');
            thumbnailRow.setAttribute('data-index', '0');
            setTimeout(() => {
                thumbnailRow.style.opacity = '1';
            }, 50);

            paginationContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => `
                <button class="carousel-page-btn ${i === 0 ? 'active' : ''}" 
                        onclick="goToMissionPage(${i}, '${stormId}', ${year}, '${missionId}')">${i + 1}</button>
            `).join('');

            prevBtn.disabled = true; // First page, disable "Prev"
            nextBtn.disabled = totalPages <= 1; // Disable "Next" if only one page

            prevBtn.onclick = () => {
                const currentIndex = parseInt(thumbnailRow.getAttribute('data-index'));
                if (currentIndex > 0) {
                    goToMissionPage(currentIndex - 1, stormId, year, missionId);
                }
            };

            nextBtn.onclick = () => {
                const currentIndex = parseInt(thumbnailRow.getAttribute('data-index'));
                if (currentIndex < totalPages - 1) {
                    goToMissionPage(currentIndex + 1, stormId, year, missionId);
                }
            };

            carousel.style.display = 'block';
        } else {
            thumbnailRow.innerHTML = '';
            paginationContainer.innerHTML = '';
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            carousel.style.display = 'none';
        }
    }

    window.updateMainImage = function(src) {
        const missionImage = document.getElementById('mission-image');
        missionImage.style.opacity = '0';
        setTimeout(() => {
            missionImage.src = src;
            missionImage.style.opacity = '1';
        }, 300);
    };

    window.goToMissionPage = function(pageIndex, stormId, year, missionId) {
        const thumbnails = [
            { src: `static/images/mission/${stormId}${year}/${missionId}_3dwind_lhf.png`, alt: "3D Wind LHF", header: "3D Wind" },
            { src: `static/images/mission/${stormId}${year}/${missionId}_3dtemp.png`, alt: "3D Temperature", header: "3D Temp" },
            { src: `static/images/mission/${stormId}${year}/${missionId}_ugradP.png`, alt: "Pressure Gradient", header: "Pressure" },
            { src: `static/images/mission/${stormId}${year}/${missionId}_ugradQL.png`, alt: "Pressure Gradient", header: "Pressure" },
        ];

        const thumbnailRow = document.getElementById('mission-thumbnail-row');
        const pageButtons = document.querySelectorAll('#pagination-buttons .carousel-page-btn');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const itemsPerPage = 3;
        const totalPages = Math.ceil(thumbnails.length / itemsPerPage);

        const start = pageIndex * itemsPerPage;
        const end = start + itemsPerPage;
        thumbnailRow.style.opacity = '0';
        thumbnailRow.innerHTML = thumbnails.slice(start, end).map(thumb => `
            <div class="thumbnail-wrapper">
                <img src="${thumb.src}" alt="${thumb.alt}" class="mission-thumbnail" 
                     onclick="updateMainImage('${thumb.src}')">
                <div class="thumbnail-header">${thumb.header}</div>
            </div>
        `).join('');
        thumbnailRow.setAttribute('data-index', pageIndex);
        setTimeout(() => {
            thumbnailRow.style.opacity = '1';
        }, 50);

        pageButtons.forEach((btn, i) => {
            btn.classList.toggle('active', i === pageIndex);
        });

        prevBtn.disabled = pageIndex === 0;
        nextBtn.disabled = pageIndex === totalPages - 1;
    };

    function initializeUI(attempt = 0, maxAttempts = 10) {
        if (!window.map) {
            if (attempt >= maxAttempts) {
                console.error('Map not initialized after', maxAttempts, 'attempts. Giving up.');
                return;
            }
            console.warn('Map not initialized yet! Retrying... (Attempt', attempt + 1, 'of', maxAttempts, ')');
            setTimeout(() => initializeUI(attempt + 1, maxAttempts), 500);
            return;
        }

        console.log('UI initializing with map:', window.map);

        fetch('static/json/storm_catalog.json')
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load storms.json: ${response.statusText}`);
                return response.json();
            })
            .then(data => {
                storms = data;
                console.log('Storm catalog loaded:', storms);

                primaryDropdown.innerHTML = '<option value="" disabled selected>Select Storm</option>';
                storms.forEach(storm => {
                    const option = document.createElement('option');
                    option.value = storm.storm_name;
                    option.textContent = storm.storm_name;
                    primaryDropdown.appendChild(option);
                });

                primaryDropdown.addEventListener('change', function() {
                    const selectedStormName = this.value;
                    console.log('Primary dropdown changed to:', selectedStormName);
                    secondaryDropdown.disabled = false;
                    secondaryDropdown.value = '';

                    const selectedStorm = storms.find(storm => storm.storm_name === selectedStormName);
                    const missionList = selectedStorm ? selectedStorm.array_of_missions : [];
                    console.log('Selected storm missions:', missionList);

                    secondaryDropdown.innerHTML = '<option value="" disabled selected>Select Mission</option>';
                    missionList.forEach(mission => {
                        const option = document.createElement('option');
                        option.value = `static/json/${selectedStormName}/${mission.filename}`;
                        option.textContent = `${selectedStormName} - Mission #${mission.mission_number} (${mission.number_of_observations} observations)`;
                        secondaryDropdown.appendChild(option);
                    });

                    if (missionList.length > 0) {
                        const firstMissionFile = `static/json/${selectedStormName}/${missionList[0].filename}`;
                        secondaryDropdown.value = firstMissionFile;
                        console.log('Auto-selecting first mission:', firstMissionFile);
                        loadStormData(firstMissionFile);
                        updateHeader(selectedStormName, missionList[0]);
                    } else {
                        updateHeader(selectedStormName, {});
                    }
                });

                secondaryDropdown.addEventListener('change', function() {
                    const selectedFile = this.value;
                    console.log('Secondary dropdown changed to:', selectedFile);
                    if (selectedFile) {
                        const selectedStormName = primaryDropdown.value;
                        const selectedStorm = storms.find(storm => storm.storm_name === selectedStormName);
                        const selectedMission = selectedStorm.array_of_missions.find(mission => 
                            `static/json/${selectedStormName}/${mission.filename}` === selectedFile);
                        console.log('Selected mission data:', selectedMission);
                        loadStormData(selectedFile);
                        updateHeader(selectedStormName, selectedMission);
                    }
                });

                const alberto = storms.find(storm => storm.storm_name === 'Alberto');
                if (alberto && alberto.array_of_missions.length > 0) {
                    primaryDropdown.value = 'Alberto';
                    console.log('Auto-selecting Alberto on page load');
                    
                    const firstMissionFile = `static/json/Alberto/${alberto.array_of_missions[0].filename}`;
                    secondaryDropdown.innerHTML = '<option value="" disabled selected>Select Mission</option>';
                    alberto.array_of_missions.forEach(mission => {
                        const option = document.createElement('option');
                        option.value = `static/json/Alberto/${mission.filename}`;
                        option.textContent = `Alberto - Mission #${mission.mission_number} (${mission.number_of_observations} observations)`;
                        secondaryDropdown.appendChild(option);
                    });
                    secondaryDropdown.value = firstMissionFile;
                    secondaryDropdown.disabled = false;
                    
                    console.log('Auto-loading first mission for Alberto:', firstMissionFile);
                    loadStormData(firstMissionFile);
                    updateHeader('Alberto', alberto.array_of_missions[0]);
                    
                    const event = new Event('change');
                    primaryDropdown.dispatchEvent(event);
                } else {
                    console.warn('Alberto not found or has no missions:', alberto);
                }
            })
            .catch(error => console.error('Error loading storms.json:', error));

        refreshButton.addEventListener('click', function() {
            const selectedFile = secondaryDropdown.value;
            if (selectedFile) {
                const selectedStormName = primaryDropdown.value;
                const selectedStorm = storms.find(storm => storm.storm_name === selectedStormName);
                const selectedMission = selectedStorm.array_of_missions.find(mission => 
                    `static/json/${selectedStormName}/${mission.filename}` === selectedFile);
                console.log('Refresh clicked, reloading:', selectedFile);
                loadStormData(selectedFile);
                updateHeader(selectedStormName, selectedMission);
            } else {
                alert('Please select a storm and mission first!');
            }
        });

        const legendToggle = document.getElementById('legend-toggle');
        const legendContent = document.getElementById('legend-content');
        let isOpen = false;

        legendToggle.addEventListener('click', function() {
            isOpen = !isOpen;
            legendContent.style.display = isOpen ? 'block' : 'none';
        });
    }

    initializeUI();
});