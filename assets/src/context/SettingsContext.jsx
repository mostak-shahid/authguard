import { createContext, useContext, useState } from 'react';
import { Toast } from '@douyinfe/semi-ui';
import settingsData from '../data/settings.json';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(settingsData);

  const handleSubmit = (section, values) => {
    // Update the specific section
    setSettings(prev => ({
      ...prev,
      [section]: values
    }));

    // Save to backend/localStorage
    // console.log('Settings saved:', { section, values });
    
    // In a real app, you'd do:
    // await fetch('/api/settings', { 
    //   method: 'POST', 
    //   body: JSON.stringify({ section, values }) 
    // });
    
    Toast.success('Settings saved successfully!');
  };

  const value = {
    settings,
    handleSubmit,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};