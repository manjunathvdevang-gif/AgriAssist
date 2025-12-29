import React, { useState, useEffect } from 'react';
import { User, Map, History, Bookmark, Settings, Edit2, Check, X, LogOut } from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserProfile } from '../types';

interface ProfileProps {
  onLogout?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(storageService.getProfile());
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleSave = () => {
      storageService.saveProfile(formData);
      setProfile(formData);
      setIsEditing(false);
  };

  const handleCancel = () => {
      setFormData(profile);
      setIsEditing(false);
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="pb-24 pt-4 px-4 space-y-6 animate-fade-in">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center relative">
        <div className="absolute top-4 right-4">
            {isEditing ? (
                <div className="flex gap-2">
                    <button onClick={handleCancel} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={18} /></button>
                    <button onClick={handleSave} className="p-2 bg-primary-100 rounded-full text-primary-600"><Check size={18} /></button>
                </div>
            ) : (
                <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-primary-600">
                    <Edit2 size={18} />
                </button>
            )}
        </div>
        
        <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center text-primary-600 border-4 border-white shadow-lg">
          <User size={48} />
        </div>
        
        {isEditing ? (
            <input 
                className="text-xl font-bold text-gray-800 text-center border-b border-gray-300 outline-none pb-1 w-full"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
            />
        ) : (
            <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
        )}

        <p className="text-gray-500 text-sm mt-1">Farmer ID: {profile.farmerId}</p>
        
        {isEditing ? (
             <input 
                className="text-gray-400 text-xs mt-1 text-center border-b border-gray-300 outline-none pb-1 w-full"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
            />
        ) : (
            <p className="text-gray-400 text-xs mt-1">{profile.location}</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <p className="text-xs text-gray-500 uppercase font-semibold">Land Area</p>
           {isEditing ? (
               <input 
                   className="text-xl font-bold text-gray-800 w-full border-b border-gray-200 outline-none"
                   value={formData.landArea}
                   onChange={(e) => handleChange('landArea', e.target.value)}
               />
           ) : (
               <p className="text-xl font-bold text-gray-800">{profile.landArea}</p>
           )}
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <p className="text-xs text-gray-500 uppercase font-semibold">Primary Crop</p>
           {isEditing ? (
               <input 
                   className="text-xl font-bold text-gray-800 w-full border-b border-gray-200 outline-none"
                   value={formData.primaryCrop}
                   onChange={(e) => handleChange('primaryCrop', e.target.value)}
               />
           ) : (
               <p className="text-xl font-bold text-gray-800">{profile.primaryCrop}</p>
           )}
        </div>
      </div>

      {/* Options List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {[
          { icon: Map, label: 'Land Details' },
          { icon: History, label: 'Crop History' },
          { icon: Bookmark, label: 'Saved Schemes' },
          { icon: Settings, label: 'Settings' },
        ].map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-center justify-between p-4 border-b border-gray-50 last:border-none hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                <item.icon size={20} />
              </div>
              <span className="font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="text-gray-400">›</div>
          </div>
        ))}
      </div>

      <button 
        onClick={onLogout}
        className="w-full py-4 text-red-500 font-bold text-sm bg-white border border-red-100 rounded-2xl hover:bg-red-50 transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        Log Out / Switch Role
      </button>

    </div>
  );
};

export default Profile;