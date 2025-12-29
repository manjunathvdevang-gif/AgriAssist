import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, ArrowUpRight, ArrowRight, Sprout, Activity, FileText, Upload, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getCropRecommendation, analyzeSoilReport, getGovernmentSchemes } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { Tab } from '../types';

const marketData = [
  { name: 'Mon', price: 2400 },
  { name: 'Tue', price: 2450 },
  { name: 'Wed', price: 2420 },
  { name: 'Thu', price: 2500 },
  { name: 'Fri', price: 2550 },
  { name: 'Sat', price: 2600 },
];

interface HomeProps {
  onNavigate: (tab: Tab) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [profile] = useState(storageService.getProfile());
  
  // Modal States
  const [showRecModal, setShowRecModal] = useState(false);
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [showSchemesModal, setShowSchemesModal] = useState(false);
  
  // Feature States
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  // Crop Rec Form
  const [soilType, setSoilType] = useState('Loamy');
  const [location, setLocation] = useState(profile.location);
  const [season, setSeason] = useState('Monsoon');

  // Soil Report Form
  const [soilReportText, setSoilReportText] = useState('');

  // Reset states when modals close
  useEffect(() => {
      if (!showRecModal && !showSoilModal && !showSchemesModal) {
          setResult(null);
          setLoading(false);
      }
  }, [showRecModal, showSoilModal, showSchemesModal]);

  const handleGetRecommendation = async () => {
    if (!location) return;
    setLoading(true);
    setResult(null);
    const res = await getCropRecommendation(soilType, season, location);
    setResult(res);
    setLoading(false);
  };

  const handleAnalyzeSoil = async () => {
      if (!soilReportText) return;
      setLoading(true);
      setResult(null);
      const res = await analyzeSoilReport(soilReportText);
      setResult(res);
      setLoading(false);
  };

  const handleGetSchemes = async () => {
      setLoading(true);
      setResult(null);
      const res = await getGovernmentSchemes(profile.location);
      setResult(res);
      setLoading(false);
  };

  return (
    <div className="pb-24 pt-4 px-4 space-y-5 animate-fade-in relative">
      
      {/* 1. Crop Recommendation Card (Hero) */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
           <Sprout size={180} />
        </div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-3 border border-white/30">
            AI Powered
          </span>
          <h2 className="text-2xl font-bold mb-2">Best Crop for Your Soil</h2>
          <p className="text-primary-100 mb-6 text-sm max-w-[80%]">
            Get personalized crop suggestions based on your soil type, season, and local weather.
          </p>
          <button 
            onClick={() => { setShowRecModal(true); setLocation(profile.location); }}
            className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center space-x-2"
          >
            <span>Check Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. Weather Alerts Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <CloudRain size={20} className="text-blue-500" />
            Weather Update
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Live</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-4xl font-bold text-gray-800">28°C</div>
            <p className="text-gray-500 text-sm mt-1">Partly Cloudy</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-1 text-blue-500"><CloudRain size={18} /></div>
              <span className="text-xs font-medium text-gray-600">60%</span>
            </div>
            <div className="text-center">
               <div className="flex justify-center mb-1 text-orange-500"><Wind size={18} /></div>
               <span className="text-xs font-medium text-gray-600">12 km/h</span>
            </div>
            <div className="text-center">
               <div className="flex justify-center mb-1 text-yellow-500"><Sun size={18} /></div>
               <span className="text-xs font-medium text-gray-600">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Market Price Updates Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Activity size={20} className="text-primary-500" />
            Market Rates
          </h3>
          <button 
            onClick={() => onNavigate(Tab.MARKETPLACE)} 
            className="text-xs text-primary-600 font-medium hover:text-primary-700"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Item 1 */}
          <div 
            onClick={() => onNavigate(Tab.MARKETPLACE)}
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
          >
            <div>
              <p className="font-semibold text-gray-800">Wheat (Lokwan)</p>
              <p className="text-xs text-gray-500">Mandi: Pune</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">₹2,600/q</p>
              <p className="text-xs text-green-600 flex items-center justify-end">
                <ArrowUpRight size={12} /> +2.4%
              </p>
            </div>
          </div>
          
          {/* Mini Chart */}
          <div className="h-16 w-full bg-green-50/50 rounded-lg overflow-hidden">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip cursor={false} contentStyle={{display: 'none'}} />
                  <Area type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Soil Health Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 shadow-sm border border-orange-100">
        <h3 className="font-bold text-gray-800 mb-2">Soil Analysis</h3>
        <p className="text-sm text-gray-600 mb-4">Know pH, moisture & nutrient levels to improve yield.</p>
        <button 
            onClick={() => setShowSoilModal(true)}
            className="w-full py-2.5 bg-white border border-orange-200 text-orange-700 font-medium rounded-xl hover:bg-orange-50 transition-colors"
        >
          Upload Soil Report
        </button>
      </div>

      {/* 5. Government Schemes Card */}
      <div className="bg-blue-50 rounded-2xl p-5 shadow-sm border border-blue-100 flex items-center justify-between">
         <div>
            <h3 className="font-bold text-blue-900 mb-1">Govt. Schemes</h3>
            <p className="text-xs text-blue-700">Latest subsidies & benefits.</p>
         </div>
         <button 
            onClick={() => { setShowSchemesModal(true); handleGetSchemes(); }}
            className="px-4 py-2 bg-white rounded-lg text-blue-600 shadow-sm text-sm font-semibold border border-blue-100"
         >
            Explore Benefits
         </button>
      </div>

      {/* MODAL: Crop Recommendation */}
      {showRecModal && (
        <Modal 
            title="Crop Advisor" 
            onClose={() => setShowRecModal(false)}
            loading={loading}
            result={result}
            onReset={() => setResult(null)}
        >
            <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                   <select 
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
                   >
                      <option>Loamy</option>
                      <option>Clay</option>
                      <option>Sandy</option>
                      <option>Black Soil</option>
                      <option>Red Soil</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                   <select 
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
                   >
                      <option>Monsoon (Kharif)</option>
                      <option>Winter (Rabi)</option>
                      <option>Summer (Zaid)</option>
                   </select>
                </div>
                <button 
                  onClick={handleGetRecommendation}
                  className="w-full py-3.5 bg-primary-600 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all mt-4"
                >
                  Get Recommendation
                </button>
            </div>
        </Modal>
      )}

      {/* MODAL: Soil Analysis */}
      {showSoilModal && (
          <Modal
            title="Soil Doctor"
            onClose={() => setShowSoilModal(false)}
            loading={loading}
            result={result}
            onReset={() => { setResult(null); setSoilReportText(''); }}
          >
              <div className="space-y-4">
                  <p className="text-sm text-gray-600">Enter details from your soil health card or lab report.</p>
                  <textarea
                    value={soilReportText}
                    onChange={(e) => setSoilReportText(e.target.value)}
                    placeholder="e.g. pH is 7.2, Nitrogen is low, organic carbon is high..."
                    className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                  />
                  <button
                    onClick={handleAnalyzeSoil}
                    disabled={!soilReportText}
                    className="w-full py-3.5 bg-orange-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    Analyze Report
                  </button>
              </div>
          </Modal>
      )}

      {/* MODAL: Govt Schemes */}
      {showSchemesModal && (
          <Modal
            title="Government Schemes"
            onClose={() => setShowSchemesModal(false)}
            loading={loading}
            result={result}
            onReset={() => { setShowSchemesModal(false); }}
            hideReset={true}
          >
              {/* No initial content needed as it loads immediately */}
              <div className="py-10 text-center text-gray-500">Fetching latest schemes for {profile.location}...</div>
          </Modal>
      )}
    </div>
  );
};

// Reusable Modal Component
interface ModalProps {
    title: string;
    onClose: () => void;
    loading: boolean;
    result: string | null;
    onReset: () => void;
    children: React.ReactNode;
    hideReset?: boolean;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, loading, result, onReset, children, hideReset }) => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 z-[100]">
      <div className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl flex flex-col animate-slide-up">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Consulting AI Expert...</p>
                </div>
            ) : result ? (
                <div className="animate-fade-in">
                    <div 
                        className="prose prose-sm text-gray-700 prose-headings:text-gray-900 prose-ul:pl-4 prose-li:mb-1"
                        dangerouslySetInnerHTML={{ __html: result }} 
                    />
                    {!hideReset && (
                        <button 
                        onClick={onReset}
                        className="w-full mt-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50"
                        >
                        Start Over
                        </button>
                    )}
                </div>
            ) : (
                children
            )}
        </div>
      </div>
    </div>
);

export default Home;