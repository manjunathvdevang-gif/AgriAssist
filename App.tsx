import React, { useState } from 'react';
import { Tab } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './screens/Home';
import Marketplace from './screens/Marketplace';
import CropGuide from './screens/CropGuide';
import Alerts from './screens/Alerts';
import Profile from './screens/Profile';
import ChatBot from './components/ChatBot';
import RoleSelection from './components/RoleSelection';
import ConsumerHome from './screens/ConsumerHome';
import Login from './screens/Login';
import Welcome from './screens/Welcome';

const App: React.FC = () => {
  // Navigation State
  const [hasStarted, setHasStarted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<'unselected' | 'farmer' | 'consumer'>('unselected');
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);

  // Function to reset app state/logout
  const handleLogout = () => {
      setIsAuthenticated(false);
      setHasStarted(false); // Go back to welcome screen on logout
      setRole('unselected');
      setActiveTab(Tab.HOME);
  };

  const handleBackToRoleSelection = () => {
      setRole('unselected');
      setActiveTab(Tab.HOME);
  }

  // --- FARMER INTERFACE RENDERER ---
  const renderFarmerScreen = () => {
    switch (activeTab) {
      case Tab.HOME:
        return <Home onNavigate={setActiveTab} />;
      case Tab.MARKETPLACE:
        return <Marketplace />;
      case Tab.CROP_GUIDE:
        return <CropGuide />;
      case Tab.ALERTS:
        return <Alerts />;
      case Tab.PROFILE:
        return <Profile onLogout={handleLogout} />;
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  };

  // --- RENDER LOGIC ---

  // 1. Show Welcome Screen
  if (!hasStarted) {
      return <Welcome onGetStarted={() => setHasStarted(true)} />;
  }

  // 2. Show Login Screen
  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={() => setIsAuthenticated(true)} 
        onBack={() => setHasStarted(false)} 
      />
    );
  }

  // 3. Show Role Selection after login
  if (role === 'unselected') {
    return <RoleSelection 
      onSelectRole={setRole} 
      onBack={() => setIsAuthenticated(false)}
    />;
  }

  // 4. Show Consumer App
  if (role === 'consumer') {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-orange-200">
            <main className="max-w-md mx-auto min-h-screen bg-gray-50 relative shadow-2xl shadow-gray-200/50">
               <ConsumerHome onBack={handleBackToRoleSelection} />
            </main>
        </div>
    );
  }

  // 5. Show Full Farmer App
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-primary-200">
      <Header onProfileClick={() => setActiveTab(Tab.PROFILE)} onBack={handleBackToRoleSelection} />
      
      <main className="max-w-md mx-auto min-h-screen bg-gray-50 relative shadow-2xl shadow-gray-200/50">
        {renderFarmerScreen()}
      </main>
      
      {/* Global AI Assistant (Only for Farmers) */}
      <ChatBot onNavigate={setActiveTab} />

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
    </div>
  );
};

export default App;