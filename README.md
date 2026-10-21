# Weather App

A simple weather app built with HTML, CSS and JavaScript. It uses the Fetch API to show live weather for any city or for your current location.

## Features

- Search weather by city name
- Get weather for your current location (browser geolocation)
- Shows temperature, feels like, humidity, wind speed and precipitation
- 5-day forecast
- Weather icons that match the condition (sunny, cloudy, rain, snow, storm, fog, night)
- Background color changes with the weather
- Loading spinner while data is being fetched
- Clear error messages (city not found, location denied, network problem)

## Technologies Used

- HTML5
- CSS3
- JavaScript (Fetch API, async/await)
- [Open-Meteo API](https://open-meteo.com/) for weather and city search (no API key needed)
- [Nominatim (OpenStreetMap)](https://nominatim.org/) to get the place name from GPS location

## Project Structure

```
weather-app/
├── index.html   # Page structure
├── style.css    # Styling, themes and spinner
└── script.js    # Fetch API calls and app logic
```

## How It Works

1. The user types a city name or clicks **Use my current location**.
2. For a city, the Geocoding API converts the name into latitude and longitude.
3. The Forecast API is called with those coordinates to get the weather data.
4. The data is shown on the page with an icon, and the background changes to match the weather.

## How to Run

1. Download or clone this repository.
2. Open the folder in VS Code.
3. Install the **Live Server** extension.
4. Right-click `index.html` and choose **Open with Live Server**.

Opening `index.html` directly also works, but the current location feature may be blocked by some browsers unless you use Live Server.

## Notes

- Allow location permission in your browser to use the current location button.
- An internet connection is required because the data comes from online APIs.

## Possible Improvements

- °C / °F toggle
- Hourly forecast
- Recent searches
- Dark/light mode button

## Author

Your Name
