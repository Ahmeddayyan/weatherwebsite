// IMPORTANT: In a production environment, never expose API keys in client-side code.
// This key should be kept secret and used server-side.
const API_KEY = '08b49ae57bb1d5e8b459aabb49ca56d2';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

let forecastData = [];
let currentPage = 1;
const itemsPerPage = 10;

async function getCurrentWeather(city) {
    const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('City not found');
    return await response.json();
}

async function getForecast(city) {
    const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('Forecast not available');
    return await response.json();
}

function updateWeatherWidget(data) {
    const weatherWidget = document.getElementById('weatherWidget');
    const cityName = document.getElementById('cityName');
    const weatherInfo = document.getElementById('weatherInfo');

    if (cityName && weatherInfo) {
        cityName.textContent = data.name;
        weatherInfo.innerHTML = `
            <div>Temperature: ${data.main.temp}°C</div>
            <div>Humidity: ${data.main.humidity}%</div>
            <div>Wind Speed: ${data.wind.speed} m/s</div>
            <div>Weather: ${data.weather[0].description}</div>
        `;

        const condition = data.weather[0].main.toLowerCase();
        if (condition.includes('cloud')) {
            weatherWidget.style.backgroundImage = 'url("path_to_cloudy_image.jpg")';
        } else if (condition.includes('rain')) {
            weatherWidget.style.backgroundImage = 'url("path_to_rainy_image.jpg")';
        } else {
            weatherWidget.style.backgroundImage = 'url("path_to_sunny_image.jpg")';
        }
    }
}

function updateForecastTable() {
    const tableBody = document.getElementById('forecastTable');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = forecastData.slice(startIndex, endIndex);

    pageData.forEach(item => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = new Date(item.dt * 1000).toLocaleDateString();
        row.insertCell(1).textContent = `${item.main.temp}°C`;
        row.insertCell(2).textContent = item.weather[0].description;
    });

    updatePagination();
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    pagination.innerHTML = '';

    const totalPages = Math.ceil(forecastData.length / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = `mx-1 px-3 py-1 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200'}`;
        button.onclick = () => {
            currentPage = i;
            updateForecastTable();
        };
        pagination.appendChild(button);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const getWeatherButton = document.getElementById('getWeather');
    if (getWeatherButton) {
        getWeatherButton.addEventListener('click', async () => {
            const cityInput = document.getElementById('cityInput');
            if (!cityInput) return;

            const city = cityInput.value;
            try {
                const currentWeather = await getCurrentWeather(city);
                updateWeatherWidget(currentWeather);

                const forecast = await getForecast(city);
                forecastData = forecast.list;
                updateForecastTable();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    const sortAscButton = document.getElementById('sortAsc');
    const sortDescButton = document.getElementById('sortDesc');
    const filterRainButton = document.getElementById('filterRain');
    const highestTempButton = document.getElementById('highestTemp');

    if (sortAscButton) {
        sortAscButton.addEventListener('click', () => {
            forecastData.sort((a, b) => a.main.temp - b.main.temp);
            updateForecastTable();
        });
    }

    if (sortDescButton) {
        sortDescButton.addEventListener('click', () => {
            forecastData.sort((a, b) => b.main.temp - a.main.temp);
            updateForecastTable();
        });
    }

    if (filterRainButton) {
        filterRainButton.addEventListener('click', () => {
            forecastData = forecastData.filter(item => item.weather[0].main.toLowerCase().includes('rain'));
            updateForecastTable();
        });
    }

    if (highestTempButton) {
        highestTempButton.addEventListener('click', () => {
            const highestTemp = Math.max(...forecastData.map(item => item.main.temp));
            forecastData = forecastData.filter(item => item.main.temp === highestTemp);
            updateForecastTable();
        });
    }
});