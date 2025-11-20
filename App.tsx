
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Journal } from './pages/Journal';
import { Calendar } from './pages/Calendar';
import { Psychology } from './pages/Psychology';
import { Analysis } from './pages/Analysis';
import { Planning } from './pages/Planning';
import { Library } from './pages/Library';
import { Card } from './components/UIComponents';

// Simple Settings Page Placeholder
const Settings: React.FC = () => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">System Configuration</h2>
    <Card title="Account Settings" index={1}>
       <div className="text-gray-500 text-sm py-10 text-center">
         User settings, API key management (via env), and rule configuration would go here.
         <br/>
         Current Mode: <span className="text-white">DEMO</span>
       </div>
    </Card>
  </div>
);

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="journal" element={<Journal />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="library" element={<Library />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="planning" element={<Planning />} />
            <Route path="psychology" element={<Psychology />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
