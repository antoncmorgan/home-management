import axios from 'axios';

// Type for weather data
export type WeatherData = {
    temperature: number | null;
    high: number | null;
    low: number | null;
    shortForecast: string;
};

// Get weather emoji based on short forecast
export function getWeatherEmoji(shortForecast: string): string {
    const forecast = shortForecast.toLowerCase();
    if (forecast.includes('sunny') || forecast.includes('clear')) return '☀️';
    if (forecast.includes('cloud')) return '☁️';
    if (forecast.includes('rain') || forecast.includes('showers')) return '🌧️';
    if (forecast.includes('snow')) return '❄️';
    if (forecast.includes('storm') || forecast.includes('thunder')) return '⛈️';
    if (forecast.includes('fog')) return '🌫️';
    return '🌡️';
}

// Get lat/lon from zipcode using OpenStreetMap Nominatim
export async function getLatLonFromZip(zip: string): Promise<{ lat: number; lon: number } | null> {
    try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=us&format=json`);
        if (res.data && res.data.length > 0) {
            return {
                lat: parseFloat(res.data[0].lat),
                lon: parseFloat(res.data[0].lon)
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

// Get daily forecast (for high/low, current temp, and shortForecast)
export async function getDailyForecast(forecastUrl: string | null): Promise<WeatherData> {
    let weatherData: WeatherData = {
        high: null,
        low: null,
        temperature: null,
        shortForecast: ''
    };
    try {
        if (!forecastUrl) {
            return weatherData;
        }
        const forecastRes = await axios.get(forecastUrl);
        const periods = forecastRes.data.properties?.periods;
        if (!periods || periods.length === 0) {
            return weatherData;
        }
        // Use first period for forecast temp/condition
        weatherData.temperature = periods[0].temperature;
        weatherData.shortForecast = periods[0].shortForecast;
        // Find today's high and low
        const today = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' });
        for (const period of periods) {
            const periodDate = new Date(period.startTime).toLocaleDateString('en-US', { timeZone: 'America/New_York' });
            if (periodDate === today) {
                if (period.isDaytime && (weatherData.high === null || period.temperature > weatherData.high)) {
                    weatherData.high = period.temperature;
                }
                if (!period.isDaytime && (weatherData.low === null || period.temperature < weatherData.low)) {
                    weatherData.low = period.temperature;
                }
            }
        }
        return weatherData;
    } catch (e) {
        return weatherData;
    }
}

// Get latest observation from station
export async function getLatestObservation(stationId: string): Promise<{ temperature: number | null } | null> {
    try {
        const res = await axios.get(`https://api.weather.gov/stations/${stationId}/observations/latest`);
        const temp = res.data.properties?.temperature?.value;
        return { temperature: temp !== null ? Math.round((temp * 9) / 5 + 32) : null };
    } catch (e) {
        return null;
    }
}

export async function getWeatherData(zip: string): Promise<WeatherData | null> {
    const latlon = await getLatLonFromZip(zip);
    if (!latlon) {
        return null;
    }
    try {
        const pointsRes = await axios.get(`https://api.weather.gov/points/${latlon.lat},${latlon.lon}`);
        const forecastUrl = pointsRes.data.properties?.forecast;
        const stationsUrl = pointsRes.data.properties?.observationStations;
        let weatherData = await getDailyForecast(forecastUrl);

        if (stationsUrl) {
            const stationsRes = await axios.get(stationsUrl);
            if (stationsRes.data.features && stationsRes.data.features.length > 0) {
                const stationId = stationsRes.data.features[0].properties.stationIdentifier;
                if (stationId) {
                    const observation = await getLatestObservation(stationId);
                    if (observation && observation.temperature !== null) {
                        // Use observed temp instead of forecast temp if available
                        weatherData.temperature = observation.temperature;
                    }
                }
            }
        }
        return weatherData;
    } catch (e) {
        return null;
    }
}