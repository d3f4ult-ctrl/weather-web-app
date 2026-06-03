const API_KEY = 'd87b7476dd05bbb576f2eb873aa319e9';

// global sound toggle used when playing notification sounds
let soundEnabled = true;
const CLICK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

function toggleSound() {
    soundEnabled = !soundEnabled;
    const el = document.querySelector('.toggle-sound');
    if (el) el.textContent = soundEnabled ? '🔊' : '🔈';
    // play a click sound when toggling
    if (soundEnabled) {
        const audio = new Audio(CLICK_SOUND);
        audio.play().catch(() => { });
    }
}

function getWeatherByCity() {
    const city = document.getElementById('city-input').value.trim();
    if (!city) return showError("Please enter a city name!");
    fetchWeather(`q=${encodeURIComponent(city)}`);
}

function getWeatherByLocation() {
    if (!navigator.geolocation) return showError("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(pos => {
        fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
    }, () => showError("Location blocked"));
}

async function fetchWeather(query) {
    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&appid=${API_KEY}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${API_KEY}&units=metric`)
        ]);
        if (!currentRes.ok) throw new Error("City not found");
        if (!forecastRes.ok) throw new Error("Forecast unavailable");
        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        showCurrent(currentData);
        showForecast(forecastData);

        if (soundEnabled) {
            const audio = new Audio(CLICK_SOUND);
            audio.play().catch(() => { });
        }

        if ((currentData.weather && currentData.weather[0] && (currentData.weather[0].main || '').toLowerCase() === 'clear') && currentData.main && currentData.main.temp > 20) {
            fireConfetti();
        }

    } catch (error) {
        showError(error.message);
    }
}

function showCurrent(data) {
    const emoji = getEmoji(data.weather[0].description, data.main.temp);
    document.querySelector('.current').innerHTML = `
        <div class="emoji">${emoji}</div>
        <h3>${data.name}, ${data.sys.country}</h3>
        <div class="temp">${Math.round(data.main.temp)}°C</div>
        <p style="font-size: 20px; text-transform: capitalize;">${data.weather[0].description}</p>
        <p> ${data.main.humidity}% | ${data.wind?.speed ?? '—'} m/s</p>
    `;
}


function showForecast(data) {
    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    document.getElementById("forecastCard").style.display = "block";

    document.getElementById("forecast").innerHTML = daily.map(day => `
    <div class="day">
        <p style="font-weight: bold;">${new Date(day.dt_txt).toLocaleDateString('en', { weekday: 'short' })}</p>
        <div style="font-size:40px;">${getEmoji(day.weather[0].description, day.main.temp)}</div>
        <p style="font-size: 24px; margin: 5px 0;">${Math.round(day.main.temp)}°C</p>
        <small>${day.weather[0].main}</small>
    </div>
    `).join('');
}

function getEmoji(weather, temp) {
    const w = (weather || '').toLowerCase();
    if (w.includes('clear') && temp > 25) return '☀️';
    if (w.includes('clear')) return '🌤️';
    if (w.includes('rain')) return '🌧️';
    if (w.includes('snow')) return '❄️';
    if (w.includes('thunder')) return '⛈️';
    if (w.includes('cloud')) return '☁️';
    if (temp > 30) return '🔥';
    return '🌡️';
}

function showError(msg) {
    document.querySelector('.current').innerHTML = `<p class="error">${msg}</p>`;
    document.getElementById("forecastCard").style.display = "none";
}

document.getElementById("city-input").addEventListener("keypress", e => {
    if (e.key === "Enter") getWeatherByCity();
});