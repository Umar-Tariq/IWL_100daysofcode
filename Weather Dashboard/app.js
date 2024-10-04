// app.js

// Replace with your actual OpenWeatherMap API Key
const apiKey = 'db1cd3a020f33297fd11294626e6481e';

// DOM Elements
const searchButton = document.getElementById('searchButton');
const cityInput = document.getElementById('cityInput');
const cityNameElem = document.getElementById('cityName');
const temperatureElem = document.getElementById('temperature');
const humidityElem = document.getElementById('humidity');
const windElem = document.getElementById('wind');
const weatherIconElem = document.getElementById('weatherIcon');
const descriptionElem = document.getElementById('description');
const weatherAlertElem = document.getElementById('weatherAlert');
const dayCards = document.querySelectorAll('.day-card');
const hourCards = document.querySelectorAll('.hour-card');
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');
const dashboard = document.querySelector('.dashboard');
const darkModeToggle = document.getElementById('darkModeToggle');

// State Variables
let isCelsius = true; // Tracks temperature unit
let currentCity = 'New York'; // Default city
let currentWeatherData = null;
let forecastData = null;

// -------------------
// 1. Initialization
// -------------------

// Fetch weather data for the default city on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData(currentCity);
});

// -------------------
// 2. Event Listeners
// -------------------

// Search button click event
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        currentCity = city;
        fetchWeatherData(city);
    }
});

// Enter keypress event for city search
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            currentCity = city;
            fetchWeatherData(city);
        }
    }
});

// Celsius/Fahrenheit toggle buttons
celsiusBtn.addEventListener('click', () => {
    if (!isCelsius) {
        isCelsius = true;
        updateTemperatureUnit();
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (isCelsius) {
        isCelsius = false;
        updateTemperatureUnit();
    }
});

// Dark mode toggle event
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    dashboard.classList.toggle('dark-mode');
    toggleDarkModeElements();
});

// -------------------
// 3. Main Functions
// -------------------

/**
 * Fetch weather data for a given city.
 * @param {string} city - The city name to fetch weather for.
 */
async function fetchWeatherData(city) {
    if (!city) {
        alert('Please enter a valid city name.');
        return;
    }

    showLoadingState();

    try {
        // Fetch current weather data
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        if (!currentWeatherResponse.ok) {
            if (currentWeatherResponse.status === 404) {
                throw new Error('City not found. Please enter a valid city name.');
            } else {
                throw new Error('Failed to fetch current weather data.');
            }
        }
        const currentData = await currentWeatherResponse.json();
        currentWeatherData = currentData;

        // Fetch forecast data (5 day / 3 hour)
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data.');
        }
        const forecast = await forecastResponse.json();
        forecastData = forecast;

        // Update UI
        updateCurrentWeatherUI();
        updateForecastUI();
        checkForWeatherAlerts();
        updateBackground();
    } catch (error) {
        handleFetchError(error.message);
    }
}

// -------------------
// 4. UI Update Functions
// -------------------

/**
 * Show loading state in UI while fetching data.
 */
function showLoadingState() {
    cityNameElem.textContent = 'Loading...';
    temperatureElem.textContent = '--°C';
    humidityElem.textContent = 'Humidity: --%';
    windElem.textContent = 'Wind: -- km/h';
    descriptionElem.textContent = 'Fetching data...';
    weatherIconElem.src = '';
    weatherAlertElem.style.display = 'none';

    // Clear forecast cards
    dayCards.forEach(card => {
        card.innerHTML = '';
    });
    hourCards.forEach(card => {
        card.innerHTML = '';
    });
}

/**
 * Update the UI with current weather data.
 */
function updateCurrentWeatherUI() {
    if (!currentWeatherData) return;

    const { name, sys, main, wind, weather } = currentWeatherData;
    const { description, icon } = weather[0];

    cityNameElem.textContent = `${name}, ${sys.country}`;
    temperatureElem.textContent = formatTemperature(main.temp);
    humidityElem.textContent = `Humidity: ${main.humidity}%`;
    windElem.textContent = `Wind: ${wind.speed} km/h`;
    descriptionElem.textContent = capitalizeFirstLetter(description);

    // Set the weather icon
    weatherIconElem.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherIconElem.alt = description;
}

/**
 * Update the UI with forecast data.
 */
function updateForecastUI() {
    if (!forecastData) return;

    // Update Weekly Forecast
    const dailyForecast = aggregateDailyForecast(forecastData.list);
    dayCards.forEach((card, index) => {
        if (dailyForecast[index]) {
            const { day, minTemp, maxTemp, icon, description } = dailyForecast[index];
            card.innerHTML = `
                <p>${day}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
                <p>${formatTemperature(maxTemp)} / ${formatTemperature(minTemp)}</p>
            `;
        }
    });

    // Update Hourly Forecast
    const hourlyForecast = forecastData.list.slice(0, 4); // Next 4 hours
    hourCards.forEach((card, index) => {
        if (hourlyForecast[index]) {
            const { dt, main, weather } = hourlyForecast[index];
            const date = new Date(dt * 1000);
            const hour = date.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true });
            const temp = main.temp;
            const icon = weather[0].icon;
            const description = weather[0].description;

            card.innerHTML = `
                <p>${hour}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
                <p>${formatTemperature(temp)}</p>
            `;
        }
    });
}

/**
 * Aggregate daily forecast data from 5 day / 3 hour data.
 * @param {Array} list - The forecast data list.
 * @returns {Array} - Aggregated daily forecast.
 */
function aggregateDailyForecast(list) {
    const daily = {};
    list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString(undefined, { weekday: 'short' });

        if (!daily[day]) {
            daily[day] = {
                day: day,
                minTemp: item.main.temp_min,
                maxTemp: item.main.temp_max,
                icon: item.weather[0].icon,
                description: item.weather[0].description
            };
        } else {
            daily[day].minTemp = Math.min(daily[day].minTemp, item.main.temp_min);
            daily[day].maxTemp = Math.max(daily[day].maxTemp, item.main.temp_max);
        }
    });

    // Convert to array and skip today
    const dailyArray = Object.values(daily);
    if (dailyArray.length > 0) dailyArray.shift(); // Remove today

    return dailyArray.slice(0, 5); // Next 5 days
}

/**
 * Check for weather alerts and display them.
 */
function checkForWeatherAlerts() {
    if (currentWeatherData.alerts && currentWeatherData.alerts.length > 0) {
        weatherAlertElem.textContent = `Alert: ${currentWeatherData.alerts[0].description}`;
        weatherAlertElem.style.display = 'block';
    } else {
        weatherAlertElem.style.display = 'none';
    }
}

/**
 * Change background based on weather condition.
 */
function updateBackground() {
    if (!currentWeatherData) return;

    const weatherMain = currentWeatherData.weather[0].main;
    dashboard.classList.remove('sunny', 'rainy', 'cloudy', 'thunderstorm', 'snow');
    switch (weatherMain.toLowerCase()) {
        case 'clear':
            dashboard.classList.add('sunny');
            break;
        case 'rain':
        case 'drizzle':
            dashboard.classList.add('rainy');
            break;
        case 'clouds':
            dashboard.classList.add('cloudy');
            break;
        case 'thunderstorm':
            dashboard.classList.add('thunderstorm');
            break;
        case 'snow':
            dashboard.classList.add('snow');
            break;
        default:
            dashboard.classList.add('cloudy');
            break;
    }
}

// -------------------
// 5. Event Handlers
// -------------------

/**
 * Update temperature unit across the UI without refetching data.
 */
function updateTemperatureUnit() {
    if (!currentWeatherData || !forecastData) return;

    // Update current temperature
    temperatureElem.textContent = formatTemperature(currentWeatherData.main.temp);

    // Update daily forecasts
    dayCards.forEach((card, index) => {
        if (forecastData.list[index]) {
            const day = aggregateDailyForecast(forecastData.list)[index];
            if (day) {
                const { maxTemp, minTemp } = day;
                card.querySelector('p:last-child').textContent = `${formatTemperature(maxTemp)} / ${formatTemperature(minTemp)}`;
            }
        }
    });

    // Update hourly forecasts
    hourCards.forEach((card, index) => {
        if (forecastData.list[index]) {
            const hour = forecastData.list[index];
            const temp = hour.main.temp;
            card.querySelector('p:last-child').textContent = `${formatTemperature(temp)}`;
        }
    });

    // Update active button styling
    celsiusBtn.classList.toggle('active', isCelsius);
    fahrenheitBtn.classList.toggle('active', !isCelsius);
}

/**
 * Toggle dark mode specific elements.
 */
function toggleDarkModeElements() {
    // Update temperature toggle buttons
    celsiusBtn.classList.toggle('dark-mode');
    fahrenheitBtn.classList.toggle('dark-mode');

    // Update forecast cards
    dayCards.forEach(card => card.classList.toggle('dark-mode'));
    hourCards.forEach(card => card.classList.toggle('dark-mode'));

    // Update dark mode toggle button text
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
}

// -------------------
// 6. Helper Functions
// -------------------

/**
 * Handle fetch errors by displaying alerts.
 * @param {string} message - Error message to display.
 */
function handleFetchError(message) {
    alert(message);
    showLoadingState();
}

/**
 * Format temperature based on the current unit (Celsius/Fahrenheit).
 * @param {number} tempC - Temperature in Celsius.
 * @returns {string} - Formatted temperature string.
 */
function formatTemperature(tempC) {
    return isCelsius ? `${Math.round(tempC)}°C` : `${Math.round(tempC * 1.8 + 32)}°F`;
}

/**
 * Capitalize the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} - Capitalized string.
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
// DOM Elements
const currentDateTimeElem = document.getElementById('currentDateTime');

// Update date and time every second
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', year: 'numeric', month: 'long', 
        day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' 
    };
    currentDateTimeElem.textContent = now.toLocaleDateString(undefined, options);
}

// Initialize date and time update
setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call
