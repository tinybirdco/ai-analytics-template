 'use client';

import ApiKeyInput from '@/app/components/ApiKeyInput';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div>
        <ApiKeyInput />
        
        {/* Other settings can go here */}
      </div>
    </div>
  );
}