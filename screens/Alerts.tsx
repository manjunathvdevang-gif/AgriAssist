import React, { useEffect, useState } from 'react';
import { CloudRain, AlertTriangle, TrendingDown, Droplets, RefreshCw } from 'lucide-react';
import { AlertItem } from '../types';
import { getFarmingAlerts } from '../services/geminiService';
import { storageService } from '../services/storageService';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async (forceRefresh = false) => {
    // 1. Try to load from local storage
    const cached = storageService.getAlerts();
    
    // 2. If valid cache exists and not forced, use it
    if (cached.length > 0 && !forceRefresh) {
        setAlerts(cached);
        return;
    }

    // 3. Else fetch from Gemini
    setLoading(true);
    const profile = storageService.getProfile();
    const newAlerts = await getFarmingAlerts(profile.location);
    
    if (newAlerts.length > 0) {
        setAlerts(newAlerts);
        storageService.saveAlerts(newAlerts);
    }
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'weather': return <CloudRain size={24} className="text-blue-600" />;
      case 'pest': return <AlertTriangle size={24} className="text-red-600" />;
      case 'irrigation': return <Droplets size={24} className="text-cyan-600" />;
      case 'market': return <TrendingDown size={24} className="text-amber-600" />;
      default: return <AlertTriangle size={24} />;
    }
  };

  const getColor = (severity: string) => {
      switch(severity) {
          case 'high': return 'bg-red-50 border-red-100';
          case 'medium': return 'bg-amber-50 border-amber-100';
          default: return 'bg-blue-50 border-blue-100';
      }
  }

  return (
    <div className="pb-24 pt-4 px-4 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800">My Alerts</h2>
        <button 
            onClick={() => loadAlerts(true)}
            disabled={loading}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors disabled:opacity-50"
        >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {loading && alerts.length === 0 && (
          <div className="text-center py-10 text-gray-500">Scanning for local alerts...</div>
      )}

      {!loading && alerts.length === 0 && (
          <div className="text-center text-gray-400 py-10">
              <p>No active alerts for your region.</p>
              <button onClick={() => loadAlerts(true)} className="text-primary-600 text-sm mt-2 underline">Scan Again</button>
          </div>
      )}
      
      {alerts.map((alert, idx) => (
        <div key={idx} className={`p-4 rounded-2xl border shadow-sm ${getColor(alert.severity)} flex gap-4 animate-fade-in`}>
           <div className="shrink-0 pt-1">
             {getIcon(alert.type)}
           </div>
           <div className="flex-1">
             <div className="flex justify-between items-start">
               <h3 className="font-bold text-gray-800">{alert.title}</h3>
               <span className="text-[10px] text-gray-500 bg-white/50 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">{alert.date}</span>
             </div>
             <p className="text-sm text-gray-700 mt-1 leading-relaxed">
               {alert.description}
             </p>
           </div>
        </div>
      ))}
    </div>
  );
};

export default Alerts;