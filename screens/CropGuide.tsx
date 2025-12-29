import React, { useState } from 'react';
import { Search, ChevronRight, Droplets, Bug, Sprout, X, Loader2 } from 'lucide-react';
import { getCropGuide } from '../services/geminiService';
import { storageService } from '../services/storageService';

const crops = [
  { name: 'Rice (Paddy)', type: 'Cereal', img: 'https://picsum.photos/100/100?random=1' },
  { name: 'Wheat', type: 'Cereal', img: 'https://picsum.photos/100/100?random=2' },
  { name: 'Tomato', type: 'Vegetable', img: 'https://picsum.photos/100/100?random=3' },
  { name: 'Cotton', type: 'Commercial', img: 'https://picsum.photos/100/100?random=4' },
];

const CropGuide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [guideResult, setGuideResult] = useState<string | null>(null);
  const [selectedCropTitle, setSelectedCropTitle] = useState('');

  const handleSearch = async (term: string, aspect: string = 'general') => {
      if (!term) return;
      setLoading(true);
      setGuideResult(null);
      setSelectedCropTitle(term);
      const result = await getCropGuide(term, aspect);
      setGuideResult(result);
      setLoading(false);
  };

  const handleCategoryClick = (aspect: string) => {
      const profile = storageService.getProfile();
      // Use user's primary crop if available, else default to 'General'
      const crop = profile.primaryCrop || 'Farming';
      handleSearch(crop, aspect);
  };

  return (
    <div className="pb-24 pt-4 px-4 space-y-6">
      
       {/* Search */}
       <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            placeholder="Search crop guide (e.g. Corn)..." 
            className="w-full bg-white pl-12 pr-4 py-3 rounded-xl border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-primary-100"
          />
       </div>

       {/* Categories */}
       <div className="grid grid-cols-2 gap-4">
         <button onClick={() => handleCategoryClick('Growing & Sowing')} className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-green-100 transition-colors">
            <Sprout size={32} className="text-green-600" />
            <span className="font-semibold text-green-800">Growing Guide</span>
         </button>
         <button onClick={() => handleCategoryClick('Fertilizers')} className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-100 transition-colors">
            <Droplets size={32} className="text-blue-600" />
            <span className="font-semibold text-blue-800">Fertilizers</span>
         </button>
         <button onClick={() => handleCategoryClick('Diseases & Pests')} className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-red-100 transition-colors">
            <Bug size={32} className="text-red-600" />
            <span className="font-semibold text-red-800">Diseases</span>
         </button>
         <button onClick={() => handleSearch('Organic Farming Tips')} className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-amber-100 transition-colors">
             <span className="text-2xl">🌱</span>
             <span className="font-semibold text-amber-800">Organic</span>
         </button>
       </div>

       {/* Popular Crops */}
       <div>
         <h3 className="font-bold text-gray-800 mb-3 text-lg">Popular Crops</h3>
         <div className="space-y-3">
            {crops.map((crop, idx) => (
               <button 
                  key={idx} 
                  onClick={() => handleSearch(crop.name)}
                  className="w-full bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
               >
                  <div className="flex items-center gap-4">
                     <img src={crop.img} alt={crop.name} className="w-12 h-12 rounded-lg object-cover" />
                     <div>
                        <h4 className="font-bold text-gray-800">{crop.name}</h4>
                        <p className="text-xs text-gray-500">{crop.type}</p>
                     </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
               </button>
            ))}
         </div>
       </div>

       {/* Guide Modal */}
       {(loading || guideResult) && (
           <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
              <div className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl flex flex-col animate-slide-up">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                      <h2 className="text-xl font-bold text-gray-800">{selectedCropTitle} Guide</h2>
                      <button onClick={() => { setGuideResult(null); setLoading(false); }} className="p-1 rounded-full hover:bg-gray-100">
                          <X size={24} className="text-gray-500" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {loading ? (
                          <div className="flex flex-col items-center justify-center h-64 space-y-4">
                              <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                              <p className="text-gray-500 font-medium">Generating expert guide...</p>
                          </div>
                      ) : (
                          <div 
                            className="prose prose-sm text-gray-700 prose-headings:text-primary-800 prose-ul:list-disc prose-ul:pl-4 prose-li:mb-2"
                            dangerouslySetInnerHTML={{ __html: guideResult || '' }} 
                          />
                      )}
                  </div>
              </div>
           </div>
       )}

    </div>
  );
};

export default CropGuide;