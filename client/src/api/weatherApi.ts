import axios from 'axios';

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

// Get NWS forecast URL from lat/lon
export async function getNWSForecastUrl(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await axios.get(`https://api.weather.gov/points/${lat},${lon}`);
    return res.data.properties?.forecast || null;
  } catch (e) {
    return null;
  }
}

// Get current temperature and weather from NWS forecast URL
export async function getCurrentWeather(forecastUrl: string): Promise<{ temperature: number; shortForecast: string } | null> {
  try {
    const res = await axios.get(forecastUrl);
    const periods = res.data.properties?.periods;
    if (periods && periods.length > 0) {
      return {
        temperature: periods[0].temperature,
        shortForecast: periods[0].shortForecast
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

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
