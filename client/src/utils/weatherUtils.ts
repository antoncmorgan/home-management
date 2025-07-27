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
