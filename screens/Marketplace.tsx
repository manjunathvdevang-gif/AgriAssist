import React, { useState, useEffect } from 'react';
import { Search, Filter, Phone, MapPin, Plus, X, MessageCircle, TrendingUp, User, Calendar, Trash2, Tag, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { BuyerListing } from '../types';

const Marketplace: React.FC = () => {
  const [viewMode, setViewMode] = useState<'buy' | 'sell'>('buy'); // 'buy' = Find Traders, 'sell' = My Listings
  
  // Data States
  const [traderListings, setTraderListings] = useState<BuyerListing[]>([]);
  const [myListings, setMyListings] = useState<BuyerListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<BuyerListing[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSellModal, setShowSellModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Detail View State
  const [selectedListing, setSelectedListing] = useState<BuyerListing | null>(null);

  // Sell Form State
  const [sellCrop, setSellCrop] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellQuantity, setSellQuantity] = useState('');

  // Initial Load
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
      const traders = storageService.getTraderListings();
      const mine = storageService.getFarmerListings();
      setTraderListings(traders);
      setMyListings(mine);
  };

  // Filter Logic
  useEffect(() => {
    const sourceData = viewMode === 'buy' ? traderListings : myListings;
    
    if (!searchQuery) {
        setFilteredListings(sourceData);
    } else {
        const lower = searchQuery.toLowerCase();
        const filtered = sourceData.filter(item => 
            item.crop.toLowerCase().includes(lower) || 
            item.location.toLowerCase().includes(lower) ||
            item.name.toLowerCase().includes(lower)
        );
        setFilteredListings(filtered);
    }
  }, [searchQuery, viewMode, traderListings, myListings]);

  const handleListCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = storageService.getProfile();
    const currentDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    
    const newListing: BuyerListing = {
      id: Date.now(),
      name: profile.name,
      location: profile.location.split(',')[0], // Just city
      crop: sellCrop,
      price: `₹${sellPrice}/q`,
      distance: '0 km',
      date: currentDate 
    };
    
    storageService.addFarmerListing(newListing);
    
    setShowSellModal(false);
    refreshData(); // Reload data
    setViewMode('sell'); // Switch to "My Listings" to show the new item
    
    // Reset form
    setSellCrop('');
    setSellPrice('');
    setSellQuantity('');
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
      if (deleteConfirmId) {
          storageService.deleteFarmerListing(deleteConfirmId);
          refreshData();
          setDeleteConfirmId(null);
      }
  };

  return (
    <div className="pb-24 pt-4 px-4 space-y-4">
      
      {/* View Toggle */}
      <div className="bg-gray-100 p-1 rounded-xl flex mb-4">
          <button 
            onClick={() => { setViewMode('buy'); setSelectedListing(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'buy' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
              Find Buyers
          </button>
          <button 
            onClick={() => { setViewMode('sell'); setSelectedListing(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'sell' ? 'bg-white text-accent-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
              My Listings
          </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="flex-1 bg-white flex items-center px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
          <Search size={20} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={viewMode === 'buy' ? "Find buyers, traders..." : "Search my listings..."} 
            className="w-full bg-transparent outline-none text-gray-700"
          />
        </div>
        <button className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-gray-600">
          <Filter size={20} />
        </button>
      </div>

      {/* Quick Filters (Only for Find Buyers) */}
      {viewMode === 'buy' && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button onClick={() => setSearchQuery('')} className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium whitespace-nowrap shadow-md shadow-primary-500/20">All Traders</button>
            <button onClick={() => setSearchQuery('Vegetable')} className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap">Vegetable Buyers</button>
            <button onClick={() => setSearchQuery('Wheat')} className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap">Grain Buyers</button>
        </div>
      )}

      {/* Listings Grid */}
      <div className="grid gap-4">
        {filteredListings.length === 0 ? (
            <div className="text-center py-10">
                <div className="bg-gray-50 inline-block p-4 rounded-full mb-3">
                    {viewMode === 'buy' ? <User size={32} className="text-gray-400" /> : <Tag size={32} className="text-gray-400" />}
                </div>
                <p className="text-gray-400">
                    {viewMode === 'buy' ? 'No buyers found.' : 'You haven\'t listed any crops yet.'}
                </p>
                {viewMode === 'sell' && (
                     <button 
                        onClick={() => setShowSellModal(true)}
                        className="mt-4 text-accent-600 font-bold text-sm underline"
                     >
                        Start Selling
                     </button>
                )}
            </div>
        ) : (
            filteredListings.map((item) => (
            <div 
                key={item.id} 
                onClick={() => setSelectedListing(item)}
                className={`bg-white p-4 rounded-2xl shadow-sm border flex flex-col gap-3 transition-colors cursor-pointer hover:bg-gray-50 ${viewMode === 'buy' ? 'border-gray-100' : 'border-accent-100'}`}
            >
                <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">{item.crop}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                       <MapPin size={14} /> {item.location} 
                       {viewMode === 'buy' && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded ml-1">{item.distance}</span>}
                    </p>
                </div>
                <div className="text-right">
                    <span className={`block font-bold text-lg ${viewMode === 'buy' ? 'text-primary-600' : 'text-accent-600'}`}>{item.price}</span>
                    <span className="text-xs text-gray-400 flex items-center justify-end gap-1">
                       {item.date && <><Calendar size={10} /> {item.date}</>}
                    </span>
                </div>
                </div>
                
                <div className="h-px bg-gray-100 w-full" />
                
                <div className="flex justify-between items-center">
                    {viewMode === 'buy' ? (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                                    {item.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                            </div>
                            <button className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-100 transition-colors pointer-events-none">
                                <Phone size={16} /> Contact
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">Active</span>
                                <span>Visible to Consumers</span>
                            </div>
                            <button 
                                onClick={(e) => handleDeleteClick(e, item.id)}
                                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
            ))
        )}
      </div>
      
      {/* Floating Sell Button */}
      <div className="bg-accent-50 border border-accent-100 p-4 rounded-xl flex justify-between items-center sticky bottom-20 shadow-lg z-10">
          <div>
            <h4 className="font-bold text-accent-700">Want to sell your harvest?</h4>
            <p className="text-xs text-accent-600">List your crops for Consumers.</p>
          </div>
          <button 
            onClick={() => setShowSellModal(true)}
            className="bg-accent-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-accent-600"
          >
            {viewMode === 'sell' ? 'Add New' : 'List Now'}
          </button>
      </div>

      {/* SELL MODAL */}
      {showSellModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-fade-in relative">
                <button 
                  onClick={() => setShowSellModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>
                <h2 className="text-xl font-bold mb-4">List Your Crop</h2>
                <p className="text-sm text-gray-500 mb-4">This listing will be visible to consumers on the AgriAssist Consumer App.</p>
                <form onSubmit={handleListCrop} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                        <input 
                          required
                          type="text" 
                          value={sellCrop}
                          onChange={(e) => setSellCrop(e.target.value)}
                          placeholder="e.g. Wheat, Tomato"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-accent-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price per Quintal (₹)</label>
                        <input 
                          required
                          type="number" 
                          value={sellPrice}
                          onChange={(e) => setSellPrice(e.target.value)}
                          placeholder="e.g. 2500"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-accent-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Optional)</label>
                        <input 
                          type="text" 
                          value={sellQuantity}
                          onChange={(e) => setSellQuantity(e.target.value)}
                          placeholder="e.g. 50 Quintals"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-accent-500"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full py-3 bg-accent-500 text-white font-bold rounded-xl shadow-md hover:bg-accent-600 transition-colors"
                    >
                        Post Listing
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full animate-scale-up">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle size={28} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Delete Listing?</h3>
                  <p className="text-gray-500 mb-6 text-center text-sm">Are you sure you want to remove this crop? It will no longer be visible to consumers.</p>
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setDeleteConfirmId(null)}
                          className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={confirmDelete}
                          className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-md shadow-red-200 transition-colors"
                      >
                          Yes, Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* LISTING DETAIL MODAL */}
      {selectedListing && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
           <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl flex flex-col animate-slide-up relative">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedListing.crop}</h2>
                    <p className="text-sm text-gray-500">
                        {viewMode === 'buy' ? 'Trader Listing' : 'My Listing'} #{selectedListing.id}
                    </p>
                 </div>
                 <button 
                    onClick={() => setSelectedListing(null)} 
                    className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                 >
                    <X size={24} />
                 </button>
              </div>

              {/* Price Tag */}
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100 mb-6 flex justify-between items-center">
                  <div>
                      <p className="text-sm text-green-700 font-medium">{viewMode === 'buy' ? 'Buying Price' : 'Selling Price'}</p>
                      <p className="text-3xl font-bold text-green-700">{selectedListing.price}</p>
                  </div>
                  <div className="bg-white p-2 rounded-full shadow-sm text-green-600">
                      <TrendingUp size={24} />
                  </div>
              </div>

              {/* Details */}
              <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                  
                  {viewMode === 'buy' ? (
                      /* Trader Profile */
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Trader Details</h3>
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg border-2 border-white shadow-sm">
                                  {selectedListing.name.charAt(0)}
                              </div>
                              <div>
                                  <p className="font-bold text-gray-800 text-lg">{selectedListing.name}</p>
                                  <div className="flex items-center text-gray-500 text-sm mt-1">
                                      <MapPin size={14} className="mr-1" />
                                      {selectedListing.location} ({selectedListing.distance})
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : (
                       /* My Listing Profile */
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm bg-accent-50/50">
                          <h3 className="text-xs font-bold text-accent-600 uppercase mb-3 tracking-wider">Your Listing Details</h3>
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 font-bold text-lg border-2 border-white shadow-sm">
                                  <User size={24} />
                              </div>
                              <div>
                                  <p className="font-bold text-gray-800 text-lg">You ({selectedListing.name})</p>
                                  <div className="flex items-center text-gray-500 text-sm mt-1">
                                      <MapPin size={14} className="mr-1" />
                                      {selectedListing.location}
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Quality/Specs */}
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Grade</p>
                          <p className="font-semibold text-gray-800">Grade A</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Quantity</p>
                          <p className="font-semibold text-gray-800">Available</p>
                      </div>
                  </div>
                  
                  {viewMode === 'buy' ? (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                          <h4 className="text-blue-800 font-bold text-sm mb-2">Trader Note</h4>
                          <p className="text-sm text-blue-700 leading-relaxed">
                              We are looking for high-quality fresh {selectedListing.crop.toLowerCase()} sourced directly from local farmers in the {selectedListing.location} region. Payment will be processed within 24 hours of delivery.
                          </p>
                      </div>
                  ) : (
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
                          <AlertCircle size={20} className="text-green-600 mt-0.5" />
                          <div>
                            <h4 className="text-green-800 font-bold text-sm mb-1">Active Listing</h4>
                            <p className="text-sm text-green-700 leading-relaxed">
                                This crop is currently visible to all consumers on the Fresh Market app. 
                            </p>
                          </div>
                      </div>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                  {viewMode === 'buy' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors active:scale-95">
                            <MessageCircle size={20} />
                            Message
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-colors active:scale-95">
                            <Phone size={20} />
                            Call Now
                        </button>
                      </div>
                  ) : (
                      <button 
                        onClick={() => {
                            setDeleteConfirmId(selectedListing.id);
                            setSelectedListing(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors border border-red-100 active:scale-95"
                      >
                          <Trash2 size={20} />
                          Delete Listing
                      </button>
                  )}
              </div>

           </div>
        </div>
      )}

    </div>
  );
};

export default Marketplace;