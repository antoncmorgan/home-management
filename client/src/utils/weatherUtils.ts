// Weather mood mapping for day/night emoji and background
export const moodMap: Record<string, { day: string; night: string; bg: string }> = {
  Clear: { day: '☀️', night: '🌙', bg: '#ffe066' },
  Sunny: { day: '🌞', night: '🌙', bg: '#ffd700' },
  Cloudy: { day: '☁️', night: '☁️', bg: '#b0bec5' },
  Overcast: { day: '🌥️', night: '☁️', bg: '#90a4ae' },
  Rain: { day: '🌧️', night: '🌧️', bg: '#80d0ff' },
  Showers: { day: '🌦️', night: '🌧️', bg: '#a7c7e7' },
  Thunderstorm: { day: '⛈️', night: '⛈️', bg: '#616161' },
  Snow: { day: '❄️', night: '❄️', bg: '#e0f7fa' },
  Fog: { day: '🌫️', night: '🌫️', bg: '#cfd8dc' },
  Mist: { day: '🌫️', night: '🌫️', bg: '#cfd8dc' },
  Default: { day: '🌈', night: '🌙', bg: '#e1bee7' }
};

// Utility functions for weather components
export function getWeatherEmoji(condition: string): string {
    const forecast = condition.toLowerCase();
    if (forecast.includes('sunny') || forecast.includes('clear')) return '☀️';
    if (forecast.includes('cloud')) return '☁️';
    if (forecast.includes('rain') || forecast.includes('showers')) return '🌧️';
    if (forecast.includes('snow')) return '❄️';
    if (forecast.includes('storm') || forecast.includes('thunder')) return '⛈️';
    if (forecast.includes('fog')) return '🌫️';
    return '🌡️';
}

export function formatHour(iso: string): string {
  const date = new Date(iso);
  let hour = date.getHours();
  const ampm = hour >= 12 ? 'p' : 'a';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour} ${ampm}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function getPrecipitationPercent(precip: number): number | null {
  return precip > 0 ? precip : null;
}
