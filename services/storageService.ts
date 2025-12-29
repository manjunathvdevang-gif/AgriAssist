import { UserProfile, BuyerListing, AlertItem } from '../types';

const KEYS = {
  PROFILE: 'agriassist_profile',
  TRADERS: 'agriassist_traders', // Traders looking to buy (For Farmers to see)
  FARMER_PRODUCE: 'agriassist_farmer_produce', // Farmers selling crops (For Consumers to see)
  ALERTS: 'agriassist_alerts'
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Rajesh Kumar',
  farmerId: '#AGRI-8821',
  location: 'Nagpur, Maharashtra',
  landArea: '5.2 Acres',
  primaryCrop: 'Cotton'
};

// Traders/Wholesalers (Displayed to Farmers)
const DEFAULT_TRADERS: BuyerListing[] = [
  { id: 1, name: 'Fresh Agro Traders', location: 'Nashik, MH', crop: 'Onion', price: '₹1,200/q', distance: '12 km', date: 'Yesterday' },
  { id: 2, name: 'Global Grain Exports', location: 'Pune, MH', crop: 'Wheat', price: '₹2,650/q', distance: '45 km', date: '2 Oct' },
  { id: 3, name: 'Organic Hub', location: 'Mumbai, MH', crop: 'Tomato', price: '₹3,000/q', distance: '120 km', date: '1 Oct' },
];

// Produce listed by Farmers (Displayed to Consumers)
const DEFAULT_FARMER_PRODUCE: BuyerListing[] = [
    { id: 101, name: 'Rajesh Kumar', location: 'Nagpur', crop: 'Fresh Cotton', price: '₹5,500/q', distance: '5 km', date: 'Today' },
    { id: 102, name: 'Suresh Patil', location: 'Solapur', crop: 'Pomegranate', price: '₹8,000/q', distance: '150 km', date: 'Yesterday' },
];

// Helper to trigger update event
const notifyListeners = () => {
    window.dispatchEvent(new Event('listings-updated'));
};

export const storageService = {
  // Profile Methods
  getProfile: (): UserProfile => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : DEFAULT_PROFILE;
  },
  
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  // --- TRADER METHODS (For Farmer App) ---
  getTraderListings: (): BuyerListing[] => {
    const data = localStorage.getItem(KEYS.TRADERS);
    return data ? JSON.parse(data) : DEFAULT_TRADERS;
  },

  // --- FARMER PRODUCE METHODS (For Consumer App & Farmer "Sell" Action) ---
  getFarmerListings: (): BuyerListing[] => {
    const data = localStorage.getItem(KEYS.FARMER_PRODUCE);
    return data ? JSON.parse(data) : DEFAULT_FARMER_PRODUCE;
  },

  addFarmerListing: (listing: BuyerListing) => {
    const current = storageService.getFarmerListings();
    const updated = [listing, ...current];
    localStorage.setItem(KEYS.FARMER_PRODUCE, JSON.stringify(updated));
    notifyListeners();
    return updated;
  },

  deleteFarmerListing: (id: number) => {
    const current = storageService.getFarmerListings();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(KEYS.FARMER_PRODUCE, JSON.stringify(updated));
    notifyListeners();
    return updated;
  },

  // Alert Methods
  getAlerts: (): AlertItem[] => {
      const data = localStorage.getItem(KEYS.ALERTS);
      return data ? JSON.parse(data) : []; 
  },

  saveAlerts: (alerts: AlertItem[]) => {
      localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  },

  clearAlerts: () => {
      localStorage.removeItem(KEYS.ALERTS);
  }
};