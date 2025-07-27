import axios from 'axios';

import type { WeatherData, HourlyForecast, DailyForecast } from '../models/weatherModel';

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
export async function getDailyForecast(forecastUrl: string | null, days: number = 1): Promise<WeatherData> {
    let weatherData: WeatherData = {
        high: null,
        low: null,
        temperature: null,
        shortForecast: '',
        dailyPeriods: [] as DailyForecast[]
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
        // Add daily periods with hi/lo logic
        weatherData.dailyPeriods = [];
        // Group periods by date
        const periodGroups: { [date: string]: any[] } = {};
        for (const p of periods) {
            const date = new Date(p.startTime).toLocaleDateString('en-US', { timeZone: 'America/New_York' });
            if (!periodGroups[date]) periodGroups[date] = [];
            periodGroups[date].push(p);
        }
        const groupDates = Object.keys(periodGroups).slice(0, days);
        for (const date of groupDates) {
            const group = periodGroups[date];
            let hi: number | null = null;
            let lo: number | null = null;
            let precip = 0;
            let condition = '';
            for (const p of group) {
                if (p.isDaytime && (hi === null || p.temperature > hi)) {
                    hi = p.temperature;
                }
                if (!p.isDaytime && (lo === null || p.temperature < lo)) {
                    lo = p.temperature;
                }
                // Use first period's condition for the day
                if (!condition) condition = p.shortForecast;
                // Use max precip for the day
                if (p.probabilityOfPrecipitation?.value > precip) precip = p.probabilityOfPrecipitation.value;
            }
            weatherData.dailyPeriods.push({
                date,
                hi: hi ?? null,
                lo: lo ?? null,
                precip,
                condition
            });
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

export async function getWeatherData(zip: string, opts?: { days?: number; hourly?: boolean }): Promise<WeatherData | null> {
    const latlon = await getLatLonFromZip(zip);
    if (!latlon) {
        return null;
    }
    const days = opts?.days ?? 1;
    const wantHourly = opts?.hourly ?? false;
    try {
        const pointsRes = await axios.get(`https://api.weather.gov/points/${latlon.lat},${latlon.lon}`);
        const forecastUrl = pointsRes.data.properties?.forecast;
        const forecastHourlyUrl = pointsRes.data.properties?.forecastHourly;
        const stationsUrl = pointsRes.data.properties?.observationStations;
        let weatherData = await getDailyForecast(forecastUrl, days);

        // Fetch hourly forecast
        if (wantHourly && forecastHourlyUrl) {
            try {
                const hourlyRes = await axios.get(forecastHourlyUrl);
                const periods = hourlyRes.data.properties?.periods;
                if (periods && periods.length > 0) {
                    weatherData.hourly = periods.slice(0, 12).map((p: any): HourlyForecast => ({
                        hour: p.startTime,
                        temp: p.temperature ?? null,
                        precip: p.probabilityOfPrecipitation?.value ?? 0,
                        condition: p.shortForecast
                    }));
                }
            } catch (e) {
                // Ignore hourly errors
            }
        }

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
        // Attach pointsRes for city/state extraction
        (weatherData as any)._pointsRes = pointsRes;
        return weatherData;
    } catch (e) {
        return null;
    }
}