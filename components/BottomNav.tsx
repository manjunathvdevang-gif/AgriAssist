import React from 'react';
import { Home, Store, BookOpen, Bell, User } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { tab: Tab.HOME, label: 'Home', icon: Home },
    { tab: Tab.MARKETPLACE, label: 'Market', icon: Store },
    { tab: Tab.CROP_GUIDE, label: 'Guide', icon: BookOpen },
    { tab: Tab.ALERTS, label: 'Alerts', icon: Bell },
    { tab: Tab.PROFILE, label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-center max-w-md mx-auto pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`flex flex-col items-center justify-center w-14 transition-all duration-200 ${
                isActive ? 'text-primary-600 scale-110' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={isActive ? 26 : 24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;