
const WEATHER_CODES = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Rain showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with hail"
};

function iconFor(code, isDay = 1) {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code <= 2) return isDay ? "⛅" : "☁️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

        function themeFor(code, isDay = 1) {
  if (!isDay) return "night";
  if (code <= 2) return "sunny";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "cloudy";
}

const $ = (id) => document.getElementById(id);
const statusEl = $("status");

function showSpinner(on) { $("spinner").hidden = !on; }

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.className = isError ? "error" : "";
}

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding request failed.");
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error(`City "${city}" not found.`);
  const r = data.results[0];
  return { lat: r.latitude, lon: r.longitude, name: `${r.name}, ${r.country || ""}` };
}

// Ye rhi (Forecast API) 
async function getWeather(lat, lon) {
  const url = "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,is_day,wind_speed_10m" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
    "&forecast_days=5&timezone=auto";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather request failed.");
  return res.json();
}

async function getPlaceName(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const d = await res.json();
    const a = d.address || {};
    return [a.city || a.town || a.village || a.county, a.country].filter(Boolean).join(", ") || "Your location";
  } catch { return "Your location"; }
}

function render(name, data) {
  const c = data.current, u = data.current_units;
  $("place").textContent = name;
  $("temp").textContent = `${Math.round(c.temperature_2m)}${u.temperature_2m}`;
  $("cond").textContent = WEATHER_CODES[c.weather_code] || "Unknown";
  $("icon").textContent = iconFor(c.weather_code, c.is_day);
  document.body.dataset.theme = themeFor(c.weather_code, c.is_day);
  $("feels").textContent = `${Math.round(c.apparent_temperature)}${u.apparent_temperature}`;
  $("humidity").textContent = `${c.relative_humidity_2m}${u.relative_humidity_2m}`;
  $("wind").textContent = `${c.wind_speed_10m} ${u.wind_speed_10m}`;
  $("precip").textContent = `${c.precipitation} ${u.precipitation}`;

  const d = data.daily;
  $("forecast").innerHTML = d.time.map((day, i) => {
    const label = new Date(day).toLocaleDateString("en", { weekday: "short" });
    return `<div><strong>${label}</strong><br><span style="font-size:1.5rem">${iconFor(d.weather_code[i])}</span><br>${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°<br>` +
           `<small>${WEATHER_CODES[d.weather_code[i]] || ""}</small></div>`;
  }).join("");
  $("result").hidden = false;
}

async function loadByCity(city) {
  try {
    $("result").hidden = true;
    setStatus("");
    showSpinner(true);
    const { lat, lon, name } = await getCoordinates(city);
    render(name, await getWeather(lat, lon));
    setStatus("");
  } catch (err) {
    $("result").hidden = true;
    setStatus(err.message, true);
  } finally {
    showSpinner(false);
  }
}

function loadByLocation() {
  if (!navigator.geolocation) return setStatus("Geolocation is not supported by this browser.", true);
  $("result").hidden = true;
  setStatus("");
  showSpinner(true);
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const { latitude: lat, longitude: lon } = pos.coords;
      const [data, name] = await Promise.all([getWeather(lat, lon), getPlaceName(lat, lon)]);
      render(name, data);
      setStatus("");
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      showSpinner(false);
    }
  }, (err) => {
    showSpinner(false);
    setStatus(err.code === 1 ? "Location permission denied. Search by city instead." : "Could not get your location.", true);
  });
}

$("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  loadByCity($("cityInput").value.trim());
});
$("locBtn").addEventListener("click", loadByLocation);

loadByLocation();
