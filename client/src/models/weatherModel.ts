// Weather model types for API and UI

export interface HourlyForecast {
  hour: string;
  temp: number | null;
  precip: number;
  condition: string;
}

export interface DailyForecast {
  date: string;
  hi: number | null;
  lo: number | null;
  precip: number;
  condition: string;
}

export type WeatherData = {
  temperature: number | null;
  high: number | null;
  low: number | null;
  shortForecast: string;
  hourly?: HourlyForecast[];
  dailyPeriods?: DailyForecast[];
};
