'use client';

import { useState } from 'react';
import { useApiKeyStore } from '@/stores/apiKeyStore';
import { X, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface ApiKeyInputProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyInput({ isOpen, onClose }: ApiKeyInputProps) {
  const { openaiKey, setOpenaiKey, clearOpenaiKey } = useApiKeyStore();
  const [inputKey, setInputKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (inputKey.trim()) {
      setOpenaiKey(inputKey.trim());
      setInputKey('');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div style={{ width: '575px', minWidth: '575px' }} className="bg-[#262626] flex flex-col relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-0">
          <h2 className="title-font">Settings</h2>
          <button className="settings-button" onClick={onClose}>
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 pt-8 pb-0">
          {openaiKey ? (
            <div>
              <div className="relative w-full mb-8">
                <input
                  type={isVisible ? "text" : "password"}
                  value={openaiKey}
                  readOnly
                  className="w-full h-[48px] px-4 pr-12 py-2 bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle focus:outline-none focus:ring-1 focus:ring-white text-[#F4F4F4] text-sm font-['Roboto']"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <button 
                    onClick={() => setIsVisible(!isVisible)}
                    className="text-[#C6C6C6] hover:text-white transition-colors"
                  >
                    {isVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="-mx-4">
                <button
                  onClick={clearOpenaiKey}
                  className="w-full py-4 transition-colors button-font bg-[var(--accent)] hover:bg-[var(--hover-accent)] hover:text-white"
                >
                  Remove Key
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="relative w-full">
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputKey.trim()) {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder="Introduce your OpenAI API Key"
                  className="w-full h-[48px] px-4 pr-12 py-2 bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle focus:outline-none focus:ring-1 focus:ring-white placeholder:text-tremor-content dark:placeholder:text-[#C6C6C6] text-[#F4F4F4] placeholder:text-sm font-['Roboto']"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <button 
                    onClick={handleSave}
                    disabled={!inputKey.trim()}
                    className="text-[#C6C6C6] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--hover-accent)]"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 mb-8 text-xs text-[#C6C6C6] font-['Roboto']">
                Your API key is stored locally in your browser and never sent to our servers.
              </p>
            </div>
          )}

          {/* Save Button */}
          {!openaiKey && (
            <div className="-mx-4 mt-4">
              <button
                onClick={handleSave}
                disabled={!inputKey.trim()}
                className={`w-full py-4 transition-colors button-font ${
                  !inputKey.trim()
                    ? 'bg-[var(--accent)] opacity-50 cursor-not-allowed'
                    : 'bg-[var(--accent)] hover:bg-[var(--hover-accent)] hover:text-white'
                }`}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 