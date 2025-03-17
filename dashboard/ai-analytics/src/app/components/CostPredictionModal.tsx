// src/app/components/CostPredictionModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Calculator } from 'lucide-react';
import { useTinybirdToken } from '@/providers/TinybirdProvider';
import { AreaChart } from '@tremor/react';

interface CostPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: Record<string, string | undefined>;
}

export default function CostPredictionModal({ 
  isOpen, 
  onClose,
  currentFilters
}: CostPredictionModalProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [tokenUsageData, setTokenUsageData] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { token } = useTinybirdToken();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // 1. Extract parameters from natural language query
      const params = await extractParametersFromQuery(query);
      
      // 2. Fetch historical token usage data
      const usageData = await fetchTokenUsageData(params);
      setTokenUsageData(usageData);
      
      // 3. Calculate predicted costs
      const predictionResult = calculatePredictedCosts(usageData, params);
      setPrediction(predictionResult);
    } catch (error) {
      console.error('Error generating prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder functions to be implemented
  const extractParametersFromQuery = async (query: string) => {
    // Will use Vercel AI SDK to extract parameters
    return { model: 'claude-sonnet', promptCost: 0.0, completionCost: 0.0 };
  };

  const fetchTokenUsageData = async (params: any) => {
    // Will fetch from Tinybird
    return [];
  };

  const calculatePredictedCosts = (usageData: any, params: any) => {
    // Will calculate costs based on parameters
    return { totalCost: 0, dailyCosts: [] };
  };

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-gray-900 rounded-lg shadow-xl w-2/3 max-w-3xl max-h-[80vh] overflow-hidden pointer-events-auto">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  AI Cost Prediction
                </h2>
                <button 
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label htmlFor="query" className="block text-sm font-medium text-gray-300 mb-2">
                      Describe your cost prediction scenario
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      id="query"
                      placeholder="e.g., How much would I spend using Claude Sonnet last month if prompt tokens cost $0.0003 and completion tokens cost $0.0015?"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="mt-2 text-xs text-gray-400">
                      Try: "What if I used GPT-4 Turbo instead of GPT-3.5 last week?" or "Estimate cost for Claude 3 Opus with 20% volume increase"
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Calculating...' : 'Calculate Prediction'}
                  </button>
                </form>
                
                {isLoading && (
                  <div className="mt-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-300">Analyzing your request and calculating costs...</p>
                  </div>
                )}
                
                {prediction && !isLoading && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-white mb-4">Cost Prediction Results</h3>
                    
                    {/* Results will go here */}
                    <div className="bg-gray-800 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-400">Current Cost</div>
                          <div className="text-2xl font-bold text-white">$0.00</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Predicted Cost</div>
                          <div className="text-2xl font-bold text-blue-400">$0.00</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Difference</div>
                          <div className="text-2xl font-bold text-green-400">$0.00 (0%)</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Chart placeholder */}
                    <div className="h-64 bg-gray-800 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-2">Cost Comparison Over Time</div>
                      {/* Chart will go here */}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}