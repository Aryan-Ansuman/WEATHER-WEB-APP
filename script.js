class WeatherApp {
  constructor() {
    this.API_KEY = "73e6b0723f884d44414a3aa6bfdf9d76";
    this.iconMapping = {
      "01d": "clear_day",
      "01n": "bedtime",
      "02d": "partly_cloudy_day",
      "02n": "partly_cloudy_night",
      "03d": "cloud",
      "03n": "cloud",
      "04d": "cloudy",
      "04n": "cloudy",
      "09d": "rainy_light",
      "09n": "rainy_light",
      "10d": "rainy_heavy",
      "10n": "rainy_heavy",
      "11d": "thunderstorm",
      "11n": "thunderstorm",
      "13d": "ac_unit",
      "13n": "ac_unit",
      "50d": "mist",
      "50n": "mist",
    };

    this.initializeElements();
    this.setupEventListeners();
    this.showForecastPlaceholder();
  }

  initializeElements() {
    this.elements = {
      cityInput: document.getElementById("city-input"),
      searchButton: document.getElementById("get-weather-button"),
      weatherInfo: document.getElementById("weather-info"),
      cityName: document.getElementById("city-name"),
      temperature: document.getElementById("temperature"),
      description: document.getElementById("description"),
      weatherIcon: document.getElementById("weather-icon"),
      feelsLike: document.getElementById("feels-like"),
      humidity: document.getElementById("humidity"),
      windSpeed: document.getElementById("wind-speed"),
      forecastList: document.getElementById("forecast-list"),
      errorMessage: document.getElementById("error-message"),
      loading: document.getElementById("loading"),
    };
  }

  setupEventListeners() {
    this.elements.searchButton.addEventListener("click", () =>
      this.handleSearch()
    );
    this.elements.cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });
  }

  async handleSearch() {
    const city = this.elements.cityInput.value.trim();
    if (!city) return;

    this.showLoading();
    try {
      const coordinates = await this.getCoordinates(city);
      const weatherData = await this.fetchWeatherData(
        coordinates.lat,
        coordinates.lon
      );
      this.displayWeatherData(weatherData, city);
    } catch (error) {
      console.error("Weather fetch error:", error);
      this.showError();
    }
    this.hideLoading();
  }

  async getCoordinates(city) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      city
    )}&limit=1&appid=${this.API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to get coordinates");

    const data = await response.json();
    if (data.length === 0) throw new Error("City not found");

    return { lat: data[0].lat, lon: data[0].lon };
  }

  async fetchWeatherData(lat, lon) {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${this.API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to fetch weather data");

    return await response.json();
  }

  displayWeatherData(data, cityName) {
    const current = data.current;
    const daily = data.daily.slice(1, 6);

    // Update current weather
    this.elements.cityName.textContent = cityName;
    this.elements.temperature.textContent = `${Math.round(current.temp)}°`;
    this.elements.description.textContent = current.weather[0].description;

    const iconCode = current.weather[0].icon;
    const materialIcon = this.iconMapping[iconCode] || "wb_sunny";
    this.elements.weatherIcon.innerHTML = `<span class="material-symbols-outlined">${materialIcon}</span>`;

    this.elements.feelsLike.textContent = `${Math.round(current.feels_like)}°`;
    this.elements.humidity.textContent = `${current.humidity}%`;
    this.elements.windSpeed.textContent = `${Math.round(
      current.wind_speed * 3.6
    )} km/h`;

    // Update 5-day forecast
    this.elements.forecastList.innerHTML = "";
    daily.forEach((day, index) => {
      const date = new Date((current.dt + (index + 1) * 86400) * 1000);
      const dayName = date.toLocaleDateString("en-US", {
        weekday: "short",
      });

      const forecastIconCode = day.weather[0].icon;
      const forecastMaterialIcon =
        this.iconMapping[forecastIconCode] || "wb_sunny";

      const forecastItem = document.createElement("div");
      forecastItem.className = "forecast-item";
      forecastItem.innerHTML = `
                        <div class="forecast-day">${dayName}</div>
                        <div class="forecast-content">
                            <div class="forecast-icon">
                                <span class="material-symbols-outlined">${forecastMaterialIcon}</span>
                            </div>
                            <div class="forecast-desc">${
                              day.weather[0].description
                            }</div>
                        </div>
                        <div class="forecast-temps">
                            <span class="temp-max">${Math.round(
                              day.temp.max
                            )}°</span>
                            <span class="temp-min">${Math.round(
                              day.temp.min
                            )}°</span>
                        </div>
                    `;
      this.elements.forecastList.appendChild(forecastItem);
    });

    this.elements.weatherInfo.classList.remove("hidden");
    this.elements.errorMessage.classList.add("hidden");
  }

  showForecastPlaceholder() {
    const placeholderData = [
      { day: "Mon", icon: "partly_cloudy_day" },
      { day: "Tue", icon: "rainy_light" },
      { day: "Wed", icon: "clear_day" },
      { day: "Thu", icon: "cloud" },
      { day: "Fri", icon: "thunderstorm" },
    ];

    this.elements.forecastList.innerHTML = "";
    placeholderData.forEach((item) => {
      const forecastItem = document.createElement("div");
      forecastItem.className = "forecast-item";
      forecastItem.style.opacity = "0.3";
      forecastItem.innerHTML = `
                        <div class="forecast-day">${item.day}</div>
                        <div class="forecast-content">
                            <div class="forecast-icon">
                                <span class="material-symbols-outlined">${item.icon}</span>
                            </div>
                            <div class="forecast-desc">Search city</div>
                        </div>
                        <div class="forecast-temps">
                            <span class="temp-max">--°</span>
                            <span class="temp-min">--°</span>
                        </div>
                    `;
      this.elements.forecastList.appendChild(forecastItem);
    });
  }

  showError() {
    this.elements.weatherInfo.classList.add("hidden");
    this.elements.errorMessage.classList.remove("hidden");
    this.showForecastPlaceholder();
  }

  showLoading() {
    this.elements.loading.classList.remove("hidden");
    this.elements.errorMessage.classList.add("hidden");
    this.elements.weatherInfo.classList.add("hidden");
  }

  hideLoading() {
    this.elements.loading.classList.add("hidden");
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp();
});
