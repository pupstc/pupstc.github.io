let map;
let barangayLayer;
let powerPlantMarkers;

let allPlants = [];
let barangayGeojsonData = null;
let barangayIndex = null;
let cityIndex = null;

const plantIcons = {
  coal: L.icon({
    iconUrl: "assets/icons/coal.jpeg",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  }),
  solar: L.icon({
    iconUrl: "assets/icons/solar.jpeg",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  }),
  hydro: L.icon({
    iconUrl: "assets/icons/hydro.jpeg",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  }),
  wind: L.icon({
    iconUrl: "assets/icons/wind.jpeg",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  }),
  geothermal: L.icon({
    iconUrl: "assets/icons/geothermal.jpeg",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  }),
  biomass: L.icon({
    iconUrl: "assets/icons/biomass.jpeg",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  }),
  diesel: L.icon({
    iconUrl: "assets/icons/diesel.jpeg",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  }),
  battery: L.icon({
    iconUrl: "assets/icons/battery.jpeg",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  }),
  default: L.icon({
    iconUrl: "assets/icons/coal.jpeg",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  })
};

function normalizeText(value) {
  if (!value) return "";
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .replace(/-/g, " ")
    .replace(/\//g, " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function polygonCentroid(rings) {
  const coords = rings[0];
  if (!coords || coords.length === 0) return null;

  let area = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    const a = x1 * y2 - x2 * y1;
    area += a;
    cx += (x1 + x2) * a;
    cy += (y1 + y2) * a;
  }

  area *= 0.5;

  if (area === 0) {
    let sumX = 0;
    let sumY = 0;
    coords.forEach(([x, y]) => {
      sumX += x;
      sumY += y;
    });
    return [sumY / coords.length, sumX / coords.length];
  }

  cx /= (6 * area);
  cy /= (6 * area);

  return [cy, cx];
}

function getFeatureCenter(feature) {
  const geometry = feature.geometry;
  if (!geometry) return null;

  if (geometry.type === "Polygon") {
    return polygonCentroid(geometry.coordinates);
  }

  if (geometry.type === "MultiPolygon") {
    return polygonCentroid(geometry.coordinates[0]);
  }

  return null;
}

function buildBarangayIndex(barangayGeojson) {
  const index = new Map();

  barangayGeojson.features.forEach(feature => {
    const props = feature.properties || {};

    const province = normalizeText(props.PROVINCE || props.NAME_1);
    const city = normalizeText(props.NAME_2);
    const barangay = normalizeText(props.NAME_3);

    const fullKey = `${province}|${city}|${barangay}`;
    const fallbackKey = `${city}|${barangay}`;
    const brgyOnlyKey = `${barangay}`;

    const center = getFeatureCenter(feature);

    const entry = {
      feature,
      center,
      props
    };

    if (!index.has(fullKey)) index.set(fullKey, entry);
    if (!index.has(fallbackKey)) index.set(fallbackKey, entry);
    if (!index.has(brgyOnlyKey)) index.set(brgyOnlyKey, entry);
  });

  return index;
}

function buildCityIndex(barangayGeojson) {
  const index = new Map();

  barangayGeojson.features.forEach(feature => {
    const props = feature.properties || {};

    const province = normalizeText(props.PROVINCE || props.NAME_1);
    const city = normalizeText(props.NAME_2);
    const cityKey = `${province}|${city}`;
    const cityOnlyKey = city;

    const center = getFeatureCenter(feature);

    const entry = {
      feature,
      center,
      props
    };

    if (!index.has(cityKey)) index.set(cityKey, entry);
    if (!index.has(cityOnlyKey)) index.set(cityOnlyKey, entry);
  });

  return index;
}

function getPlantIcon(plants) {
  if (!plants.length) return plantIcons.default;

  const fuel = normalizeText(plants[0].fuel_type);

  if (fuel.includes("coal")) return plantIcons.coal;
  if (fuel.includes("solar")) return plantIcons.solar;
  if (fuel.includes("hydro")) return plantIcons.hydro;
  if (fuel.includes("wind")) return plantIcons.wind;
  if (fuel.includes("geothermal")) return plantIcons.geothermal;
  if (fuel.includes("biomass")) return plantIcons.biomass;
  if (fuel.includes("battery")) return plantIcons.battery;
  if (fuel.includes("diesel")) return plantIcons.diesel;

  return plantIcons.default;
}

function buildPlantLookup(plants, barangayIndex, cityIndex) {
  const matched = new Map();
  const unmatched = [];

  plants.forEach(plant => {
    const province = normalizeText(plant.province);
    const city = normalizeText(plant.city);
    const barangay = normalizeText(plant.barangay);

    let match = null;
    let markerKey = "";

    if (barangay) {
      const fullKey = `${province}|${city}|${barangay}`;
      const fallbackKey = `${city}|${barangay}`;
      const brgyOnlyKey = `${barangay}`;

      match =
        barangayIndex.get(fullKey) ||
        barangayIndex.get(fallbackKey) ||
        barangayIndex.get(brgyOnlyKey);

      if (match) {
        markerKey = `${match.props.NAME_1}|${match.props.NAME_2}|${match.props.NAME_3}`;
      }
    } else {
      const cityKey = `${province}|${city}`;
      match = cityIndex.get(cityKey) || cityIndex.get(city);

      if (match) {
        markerKey = `${match.props.NAME_1}|${match.props.NAME_2}|CITY_FALLBACK`;
      }
    }

    if (!match || !match.center) {
      unmatched.push(plant);
      return;
    }

    if (!matched.has(markerKey)) {
      matched.set(markerKey, {
        center: match.center,
        barangayFeature: match.feature,
        plants: [],
        isCityFallback: !barangay
      });
    }

    matched.get(markerKey).plants.push(plant);
  });

  return { matched, unmatched };
}

function populateSelect(selectId, values) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="ALL">ALL</option>';

  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function populateFilters(plants) {
  const regions = [...new Set(
    plants.map(p => p.region).filter(Boolean)
  )].sort((a, b) => String(a).localeCompare(String(b)));

  const provinces = [...new Set(
    plants.map(p => p.province).filter(Boolean)
  )].sort((a, b) => String(a).localeCompare(String(b)));

  const fuelTypes = [...new Set(
    plants.map(p => p.fuel_type).filter(Boolean)
  )].sort((a, b) => String(a).localeCompare(String(b)));

  populateSelect("filterRegion", regions);
  populateSelect("filterProvince", provinces);
  populateSelect("filterFuelType", fuelTypes);
}

function getFilteredPlants() {
  const selectedRegion = document.getElementById("filterRegion").value;
  const selectedProvince = document.getElementById("filterProvince").value;
  const selectedFuelType = document.getElementById("filterFuelType").value;
  const searchText = normalizeText(document.getElementById("filterSearch").value);

  return allPlants.filter(plant => {
    const regionOk = selectedRegion === "ALL" || plant.region === selectedRegion;
    const provinceOk = selectedProvince === "ALL" || plant.province === selectedProvince;
    const fuelOk = selectedFuelType === "ALL" || plant.fuel_type === selectedFuelType;
    const searchOk =
      !searchText ||
      normalizeText(plant.power_plant).includes(searchText);

    return regionOk && provinceOk && fuelOk && searchOk;
  });
}

function updateProvinceOptions() {
  const selectedRegion = document.getElementById("filterRegion").value;

  let plants = allPlants;
  if (selectedRegion !== "ALL") {
    plants = plants.filter(p => p.region === selectedRegion);
  }

  const provinces = [...new Set(
    plants.map(p => p.province).filter(Boolean)
  )].sort((a, b) => String(a).localeCompare(String(b)));

  populateSelect("filterProvince", provinces);
}

function updateSummary(plantCount, markerCount, unmatchedCount) {
  const el = document.getElementById("resultSummary");
  el.textContent = `${plantCount} plants | ${markerCount} mapped locations`;
}

function renderPowerPlantMarkers(plants) {
  if (powerPlantMarkers) {
    powerPlantMarkers.clearLayers();
  } else {
    powerPlantMarkers = L.layerGroup().addTo(map);
  }

  const { matched, unmatched } = buildPlantLookup(plants, barangayIndex, cityIndex);

  matched.forEach(({ center, plants, barangayFeature, isCityFallback }) => {
    const props = barangayFeature.properties || {};

    const title = isCityFallback
      ? `${props.NAME_2 || "Unknown City"}`
      : `${props.NAME_3 || "Unknown Barangay"}`;

    const subtitle = `${props.NAME_2 || ""}, ${props.PROVINCE || ""}`;

    const popupHtml = `
      <div style="min-width: 260px;">
        <strong>${title}</strong><br>
        ${subtitle}<br>
        <small>${plants.length} power plant${plants.length > 1 ? "s" : ""}</small>
        <hr>
        <ul style="padding-left: 18px; margin-bottom: 0;">
          ${plants.map(p => `
            <li>
              <strong>${p.power_plant || "Unnamed Plant"}</strong><br>
              ${p.fuel_type || "Unknown fuel"} | ${p.capacity_numerical_value ?? "N/A"} MW
            </li>
          `).join("")}
        </ul>
      </div>
    `;

    L.marker(center, {
      icon: getPlantIcon(plants)
    })
      .bindPopup(popupHtml)
      .addTo(powerPlantMarkers);
  });

  updateSummary(plants.length, matched.size, unmatched.length);
}

function bindFilterEvents() {
  document.getElementById("filterRegion").addEventListener("change", () => {
    updateProvinceOptions();
  });

  document.getElementById("applyFiltersBtn").addEventListener("click", () => {
    const filtered = getFilteredPlants();
    renderPowerPlantMarkers(filtered);
  });

  document.getElementById("resetFiltersBtn").addEventListener("click", () => {
    document.getElementById("filterRegion").value = "ALL";
    document.getElementById("filterProvince").value = "ALL";
    document.getElementById("filterFuelType").value = "ALL";
    document.getElementById("filterSearch").value = "";
    updateProvinceOptions();
    renderPowerPlantMarkers(allPlants);
  });
}

function renderMap() {
  map = L.map("map", {
    maxZoom: 20,
    minZoom: 6,
    zoomControl: false
  }).setView([13, 122], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  Promise.all([
    fetch("res/Barangays.json").then(r => r.json()),
    fetch("data/power_plants_ph.json").then(r => r.json())
  ])
    .then(([barangayGeojson, plants]) => {
      barangayGeojsonData = barangayGeojson;
      allPlants = plants;

      barangayLayer = L.geoJSON(barangayGeojson, {
        style: {
          color: "white",
          opacity: 0,
          weight: 1,
          fillColor: "transparent",
          fillOpacity: 0
        }
      }).addTo(map);

      barangayIndex = buildBarangayIndex(barangayGeojson);
      cityIndex = buildCityIndex(barangayGeojson);

      populateFilters(allPlants);
      bindFilterEvents();
      renderPowerPlantMarkers(allPlants);
    })
    .catch(err => console.error("Error loading map data:", err));
}
