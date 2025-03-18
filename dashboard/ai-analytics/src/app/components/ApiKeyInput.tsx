'use client';

import { useState } from 'react';
import { useApiKeyStore } from '@/stores/apiKeyStore';

export default function ApiKeyInput() {
  const { openaiKey, setOpenaiKey, clearOpenaiKey } = useApiKeyStore();
  const [inputKey, setInputKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleSave = () => {
    if (inputKey.trim()) {
      setOpenaiKey(inputKey.trim());
      setInputKey('');
    }
  };

  return (
    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
      <h3 className="text-lg font-medium mb-2">OpenAI API Key</h3>
      
      {openaiKey ? (
        <div>
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isVisible ? openaiKey : '••••••••••••••••••••••' + openaiKey.slice(-5)}
            </span>
            <button 
              onClick={() => setIsVisible(!isVisible)} 
              className="ml-2 text-xs text-indigo-600 hover:text-indigo-800"
            >
              {isVisible ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            onClick={clearOpenaiKey}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Remove Key
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
            />
            <button
              onClick={handleSave}
              className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Your API key is stored locally in your browser and never sent to our servers.
          </p>
        </div>
      )}
    </div>
  );
} 