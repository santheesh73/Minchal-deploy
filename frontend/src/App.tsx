import React from 'react';
import { BillCapture } from './components/BillCapture';
import { AppliancePicker } from './components/AppliancePicker';
import { ResultScreen } from './components/ResultScreen';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 3-step router stub: Capture → Appliances → Result */}
      <BillCapture />
      <AppliancePicker />
      <ResultScreen />
    </div>
  );
}

export default App;