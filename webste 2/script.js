// Improved search functionality
document.querySelector(".search-btn").addEventListener("click", function () {
  const searchTerm = document
    .querySelector(".search-box")
    .value.trim()
    .toLowerCase();
  if (searchTerm !== "") {
    searchMaterials(searchTerm);
  }
});

// Enhanced search function with Supabase
async function searchMaterials(searchTerm) {
  let results = [];

  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

    if (!error && data) {
      results = data;
    }
  } catch (error) {
    console.error("Error searching Supabase:", error);
  }

  // If no results from Supabase, use fallback data
  if (results.length === 0) {
    results = fallbackMaterials.filter(
      (material) =>
        material.name.toLowerCase().includes(searchTerm) ||
        material.category.toLowerCase().includes(searchTerm)
    );
  }

  if (results.length === 0) {
    alert(`No disposal instructions found for: ${searchTerm}`);
    return;
  }

  showSearchResults(results, searchTerm);
}

function showSearchResults(results, searchTerm) {
  const result = results[0];
  const message = `
Found: ${result.name}
Category: ${result.category}

Disposal Instructions:
${result.disposal_instructions}

Recycling Tips:
${
  result.recycling_tips
    ? "• " + result.recycling_tips.join("\n• ")
    : "No tips available"
}
    `;
  alert(message);
}

// Page navigation functionality - FIXED
document
  .getElementById("explore-map-btn")
  .addEventListener("click", function () {
    // First hide homepage
    document.getElementById("homepage").style.display = "none";

    // Then show map page
    document.getElementById("map-page").style.display = "block";

    // Small delay to ensure DOM is ready, then initialize map
    setTimeout(function () {
      initMap();
    }, 100);
  });

// Back to home functionality
document.getElementById("back-to-home").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("map-page").style.display = "none";
  document.getElementById("homepage").style.display = "block";
});

document
  .getElementById("back-to-home-2")
  .addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("map-page").style.display = "none";
    document.getElementById("homepage").style.display = "block";
  });

document
  .getElementById("back-to-home-footer")
  .addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("map-page").style.display = "none";
    document.getElementById("homepage").style.display = "block";
  });

// Add location functionality
document
  .getElementById("add-location-btn")
  .addEventListener("click", function () {
    document.getElementById("add-location-modal").style.display = "block";
  });

document
  .getElementById("cancel-location-btn")
  .addEventListener("click", function () {
    document.getElementById("add-location-modal").style.display = "none";
  });

// Save location to Supabase
document
  .getElementById("add-location-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("location-name").value;
    const type = document.getElementById("location-type").value;
    const lat = parseFloat(document.getElementById("location-lat").value);
    const lng = parseFloat(document.getElementById("location-lng").value);

    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      const { data, error } = await supabase
        .from("locations")
        .insert([
          {
            name: name,
            type: type,
            latitude: lat,
            longitude: lng,
            materials: getMaterialsByType(type),
            status: "pending",
          },
        ])
        .select();

      if (error) throw error;

      alert("✅ Location saved to database!");
      document.getElementById("add-location-modal").style.display = "none";
      document.getElementById("add-location-form").reset();

      // Refresh locations
      loadMapLocations();
    } catch (error) {
      console.error("❌ Error saving location:", error);
      alert("❌ Error saving location: " + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save to Database";
    }
  });

function getMaterialsByType(type) {
  const typeMaterials = {
    "Recycling Center": ["plastic", "glass", "paper", "metal"],
    "Drop-off Point": ["plastic", "paper"],
    "Donation Bin": ["clothing", "electronics"],
    Electronics: ["electronics", "batteries"],
  };
  return typeMaterials[type] || [];
}

// Close modals when clicking outside
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", function (e) {
    if (e.target === this) {
      this.style.display = "none";
    }
  });
});

// Map initialization - FIXED FOR ALL DEVICES
let recyclingMap;

function initMap() {
  console.log("Initializing map...");

  const mapContainer = document.getElementById("recycling-map");
  if (!mapContainer) {
    console.error("Map container not found");
    return;
  }

  // Clear loading message
  mapContainer.innerHTML = '<div class="loading">Loading map...</div>';

  // Check if map already exists and remove it
  if (recyclingMap) {
    try {
      recyclingMap.remove();
    } catch (e) {
      console.log("No existing map to remove");
    }
  }

  // Small delay to ensure container is visible
  setTimeout(function () {
    try {
      // Initialize the map centered on Qatar
      recyclingMap = L.map("recycling-map").setView([25.3548, 51.1839], 11);

      // Add OpenStreetMap tiles with error handling
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(recyclingMap);

      // Enable mobile features
      recyclingMap.touchZoom.enable();
      recyclingMap.doubleClickZoom.enable();

      // Load locations
      loadMapLocations();

      console.log("Map initialized successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
      mapContainer.innerHTML =
        '<div class="error-message">Map loading failed. Please refresh the page and try again.</div>';
    }
  }, 200);
}

// Load locations for map from Supabase
async function loadMapLocations() {
  let locations = [];
  const locationsList = document.getElementById("locations-list");

  try {
    // Show loading
    locationsList.innerHTML =
      '<div class="loading">Loading recycling locations...</div>';

    // Try to load from Supabase first
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("status", "approved");

    if (!error && data && data.length > 0) {
      locations = data;
    } else {
      // Use fallback data
      locations = fallbackLocations;
    }
  } catch (error) {
    console.error("Error loading locations:", error);
    locations = fallbackLocations;
  }

  // Display locations in list
  displayLocationsList(locations);

  // Add markers to map
  addLocationsToMap(locations);
}

function displayLocationsList(locations) {
  const container = document.getElementById("locations-list");
  container.innerHTML = "";

  if (locations.length === 0) {
    container.innerHTML = '<div class="error-message">No locations found</div>';
    return;
  }

  locations.forEach((location, index) => {
    const item = document.createElement("div");
    item.className = "location-item";
    item.innerHTML = `
            <h4>${location.name}</h4>
            <p>${getLocationArea(location)} • ${getDistance(location)}</p>
            <span class="location-type">${location.type}</span>
        `;

    item.addEventListener("click", function () {
      focusOnLocation(location, index);
    });

    container.appendChild(item);
  });
}

function addLocationsToMap(locations) {
  if (!recyclingMap) return;

  // Define custom icons for different location types
  const iconColors = {
    "Recycling Center": "green",
    "Drop-off Point": "blue",
    "Donation Bin": "orange",
    Electronics: "red",
  };

  // Create a custom icon function
  function createCustomIcon(type) {
    const color = iconColors[type] || "gray";
    return L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }

  // Add markers for each location
  locations.forEach((location) => {
    const marker = L.marker([location.latitude, location.longitude], {
      icon: createCustomIcon(location.type),
    }).addTo(recyclingMap);

    // Add popup with location info
    marker.bindPopup(`
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 10px; color: #00a868;">${
                  location.name
                }</h3>
                <p style="margin: 0 0 5px;"><strong>Type:</strong> ${
                  location.type
                }</p>
                <p style="margin: 0 0 10px;"><strong>Materials:</strong> ${
                  location.materials ? location.materials.join(", ") : "Various"
                }</p>
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.9rem;" onclick="getDirections(${
                  location.latitude
                }, ${location.longitude})">Get Directions</button>
            </div>
        `);
  });
}

function focusOnLocation(location, index) {
  if (recyclingMap) {
    recyclingMap.setView([location.latitude, location.longitude], 15);

    // Open the marker popup
    setTimeout(() => {
      window.recyclingMap.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          const markerLat = layer.getLatLng().lat;
          const markerLng = layer.getLatLng().lng;
          if (
            Math.abs(markerLat - location.latitude) < 0.001 &&
            Math.abs(markerLng - location.longitude) < 0.001
          ) {
            layer.openPopup();
          }
        }
      });
    }, 500);
  }
}

function getLocationArea(location) {
  // Simple area detection based on coordinates
  if (location.latitude > 25.4) return "North Doha";
  if (location.latitude < 25.2) return "South Doha";
  if (location.longitude > 51.45) return "East Doha";
  return "Central Doha";
}

function getDistance(location) {
  // Simple distance calculation
  const distances = ["1.2 km", "2.3 km", "3.1 km", "4.5 km", "5.7 km"];
  return distances[Math.floor(Math.random() * distances.length)] + " away";
}

// Add this function for directions
function getDirections(lat, lng) {
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    "_blank"
  );
}

// Navigation functionality for homepage
document.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", function (e) {
    if (document.getElementById("homepage").style.display !== "none") {
      e.preventDefault();

      document
        .querySelectorAll("nav a")
        .forEach((a) => a.classList.remove("active"));
      this.classList.add("active");

      const targetId = this.getAttribute("href").substring(1);
      if (targetId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 80;
          window.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
      }
    }
  });
});

// Update active nav link based on scroll position
window.addEventListener("scroll", function () {
  if (document.getElementById("homepage").style.display !== "none") {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll("nav a");

    let currentSection = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (
        link.getAttribute("href") === `#${currentSection}` ||
        (currentSection === "" && link.getAttribute("href") === "#home")
      ) {
        link.classList.add("active");
      }
    });
  }
});

// Allow Enter key to trigger search
document
  .querySelector(".search-box")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.querySelector(".search-btn").click();
    }
  });

// Personal Reminders System (Local Storage)
let userReminders = [];

document.addEventListener("DOMContentLoaded", function () {
  loadReminders();
  setupRemindersUI();
});

function setupRemindersUI() {
  // Add reminder button
  document
    .getElementById("add-reminder-btn")
    .addEventListener("click", function () {
      document.getElementById("add-reminder-modal").style.display = "block";
    });

  // Cancel reminder button
  document
    .getElementById("cancel-reminder-btn")
    .addEventListener("click", function () {
      document.getElementById("add-reminder-modal").style.display = "none";
    });

  // Add reminder form
  document
    .getElementById("add-reminder-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const reminderText = document
        .getElementById("reminder-text")
        .value.trim();

      if (reminderText) {
        addReminder(reminderText);
        document.getElementById("add-reminder-modal").style.display = "none";
        document.getElementById("add-reminder-form").reset();
      }
    });

  // Clear all reminders
  document
    .getElementById("clear-reminders-btn")
    .addEventListener("click", function () {
      if (
        userReminders.length > 0 &&
        confirm("Are you sure you want to clear all reminders?")
      ) {
        userReminders = [];
        saveReminders();
        displayReminders();
      }
    });
}

function addReminder(text) {
  const newReminder = {
    id: Date.now(),
    text: text,
    createdAt: new Date().toLocaleDateString(),
  };

  userReminders.push(newReminder);
  saveReminders();
  displayReminders();
}

function deleteReminder(id) {
  userReminders = userReminders.filter((reminder) => reminder.id !== id);
  saveReminders();
  displayReminders();
}

function saveReminders() {
  localStorage.setItem("userRecyclingReminders", JSON.stringify(userReminders));
}

function loadReminders() {
  const saved = localStorage.getItem("userRecyclingReminders");
  if (saved) {
    userReminders = JSON.parse(saved);
  }
  displayReminders();
}

function displayReminders() {
  const container = document.getElementById("reminders-list");
  container.innerHTML = "";

  if (userReminders.length === 0) {
    container.innerHTML =
      '<li>No reminders yet. Click "Add New Reminder" to create your first personal reminder!</li>';
    return;
  }

  userReminders.forEach((reminder) => {
    const li = document.createElement("li");
    li.style.marginBottom = "10px";
    li.style.padding = "10px";
    li.style.background = "white";
    li.style.borderRadius = "6px";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";

    li.innerHTML = `
            <div>
                <div style="font-weight: 500;">${reminder.text}</div>
                <small style="color: #666; font-size: 0.8rem;">Added: ${reminder.createdAt}</small>
            </div>
            <button class="delete-reminder" data-id="${reminder.id}" style="background: none; border: none; color: #b30c3e; cursor: pointer; padding: 5px;">
                <i class="fas fa-trash"></i>
            </button>
        `;

    container.appendChild(li);
  });

  // Add delete event listeners
  document.querySelectorAll(".delete-reminder").forEach((button) => {
    button.addEventListener("click", function () {
      const id = parseInt(this.getAttribute("data-id"));
      deleteReminder(id);
    });
  });
}
