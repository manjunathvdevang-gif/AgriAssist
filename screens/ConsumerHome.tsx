import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Filter, ShoppingBag, Heart, ArrowLeft, Calendar } from 'lucide-react';
import { storageService } from '../services/storageService';
import { BuyerListing } from '../types';

interface ConsumerHomeProps {
  onBack: () => void;
}

const ConsumerHome: React.FC<ConsumerHomeProps> = ({ onBack }) => {
  const [listings, setListings] = useState<BuyerListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<BuyerListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const loadListings = () => {
    const data = storageService.getFarmerListings();
    setListings(data);
  };

  useEffect(() => {
    loadListings();

    // Listen for updates (e.g. if deleted from another tab or component)
    const handleUpdate = () => loadListings();
    
    window.addEventListener('listings-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate); // Ensures updates when switching back to this tab

    return () => {
        window.removeEventListener('listings-updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
        window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  useEffect(() => {
    let result = listings;

    // Filter by search
    if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(item => 
            item.crop.toLowerCase().includes(lower) || 
            item.location.toLowerCase().includes(lower) ||
            item.name.toLowerCase().includes(lower)
        );
    }
    
    // Simple mock category filtering based on text logic (in real app, crop would have category field)
    if (selectedCategory !== 'All') {
        // This is a basic filter simulation
        if (selectedCategory === 'Vegetables') {
            result = result.filter(item => ['tomato', 'onion', 'potato', 'spinach'].some(v => item.crop.toLowerCase().includes(v)));
        } else if (selectedCategory === 'Fruits') {
            result = result.filter(item => ['apple', 'banana', 'mango', 'pomegranate'].some(v => item.crop.toLowerCase().includes(v)));
        }
    }

    setFilteredListings(result);
  }, [searchQuery, selectedCategory, listings]);

  return (
    <div className="min-h-screen bg-gray-50 pb-safe animate-fade-in">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
              <button 
                onClick={onBack} 
                className="flex items-center gap-1 py-2 pr-3 pl-1 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                  <ArrowLeft size={22} />
                  <span className="text-sm font-semibold">Back</span>
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1"></div>
              <div>
                  <h1 className="text-lg font-bold text-gray-800 leading-tight">Fresh Market</h1>
                  <p className="text-[10px] text-green-600 flex items-center gap-1 font-medium">
                      <MapPin size={10} /> Nagpur, IN
                  </p>
              </div>
          </div>
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shadow-sm border border-orange-200">
              <ShoppingBag size={20} />
          </div>
      </header>

      <div className="p-4 space-y-6">
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 bg-white flex items-center px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <Search size={20} className="text-gray-400 mr-2" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fresh vegetables, fruits..." 
                    className="w-full bg-transparent outline-none text-gray-700"
                />
            </div>
            <button className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-gray-600">
                <Filter size={20} />
            </button>
          </div>

          {/* Categories */}
          <div>
              <h3 className="font-bold text-gray-800 mb-3">Categories</h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy'].map((cat) => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                            selectedCategory === cat 
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200' 
                            : 'bg-white text-gray-600 border border-gray-100'
                        }`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>
          </div>

          {/* Featured Listings */}
          <div>
              <div className="flex justify-between items-end mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">Direct from Farmers</h3>
                  <span className="text-xs text-gray-400">{filteredListings.length} items</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                  {filteredListings.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                          <p className="text-gray-400">No crops found matching your search.</p>
                      </div>
                  ) : (
                      filteredListings.map((item) => (
                          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 animate-fade-in group">
                              <div className="w-24 h-24 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                                  {/* Placeholder for crop image */}
                                  <span className="text-3xl">🥬</span>
                              </div>
                              <div className="flex-1 flex flex-col justify-between py-1">
                                  <div>
                                      <div className="flex justify-between items-start">
                                          <h4 className="font-bold text-gray-800 text-lg">{item.crop}</h4>
                                          <span className="text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-lg text-xs">{item.price}</span>
                                      </div>
                                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                          <MapPin size={12} /> {item.location} • {item.distance}
                                      </p>
                                      <div className="flex justify-between items-center mt-1">
                                          <p className="text-xs text-gray-400">Farmer: {item.name}</p>
                                          {item.date && (
                                              <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                  <Calendar size={10} /> {item.date}
                                              </span>
                                          )}
                                      </div>
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                      <button className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold shadow-md shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                                          <Phone size={14} /> Call
                                      </button>
                                      <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors">
                                          <Heart size={18} />
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>

      </div>
    </div>
  );
};

export default ConsumerHome;