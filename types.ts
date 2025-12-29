export enum Tab {
  HOME = 'HOME',
  MARKETPLACE = 'MARKETPLACE',
  CROP_GUIDE = 'CROP_GUIDE',
  ALERTS = 'ALERTS',
  PROFILE = 'PROFILE',
}

export interface Crop {
  id: string;
  name: string;
  category: string;
  image: string;
  price?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainChance: number;
}

export interface AlertItem {
  id: string;
  type: 'weather' | 'pest' | 'market' | 'irrigation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
}

export interface MarketItem {
  commodity: string;
  price: number;
  unit: string;
  change: number; // percentage
}

export interface BuyerListing {
  id: number;
  name: string;
  location: string;
  crop: string;
  price: string;
  distance: string;
  date?: string; // Added date field
}

export interface UserProfile {
  name: string;
  farmerId: string;
  location: string;
  landArea: string;
  primaryCrop: string;
}