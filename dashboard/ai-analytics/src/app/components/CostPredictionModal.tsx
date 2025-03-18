// src/app/components/CostPredictionModal.tsx
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Calculator, Copy, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, BarChart } from '@tremor/react';
import { useTinybirdToken } from '@/providers/TinybirdProvider';
import { fetchLLMUsage } from '@/services/tinybird';

// Define the type for chart tooltip payload
interface ChartTooltipPayload {
  color: string;
  dataKey: string;
  fill: string;
  name: string;
  stroke: string;
  value: number;
  payload: {
    date: string;
    actualCost: number;
    predictedCost: number;
  };
}

interface CostPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: Record<string, string | undefined>;
}

interface CostParameters {
  model: string | null;
  promptTokenCost: number | null;
  completionTokenCost: number | null;
  discount: number;
  timeframe: string;
  volumeChange: number;
  start_date: string;
  end_date: string;
  group_by?: string;
  organization?: string | null;
  project?: string | null;
  environment?: string | null;
  provider?: string | null;
  user?: string | null;
}

interface DailyCost {
  date: string;
  actualCost: number;
  predictedCost: number;
}

interface UsageDataItem {
  date: string;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_cost: number;
  category?: string;
}

interface DateAggregatedData {
  prompt_tokens: number;
  completion_tokens: number;
  total_cost: number;
}

export default function CostPredictionModal({ 
  isOpen, 
  onClose,
  currentFilters
}: CostPredictionModalProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parameters, setParameters] = useState<CostParameters | null>(null);
  const [dailyCosts, setDailyCosts] = useState<DailyCost[]>([]);
  const [summary, setSummary] = useState<{
    actualTotal: number;
    predictedTotal: number;
    difference: number;
    percentChange: number;
  } | null>(null);
  const [copiedExample, setCopiedExample] = useState<number | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [usageData, setUsageData] = useState<UsageDataItem[]>([]);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [chartCategories, setChartCategories] = useState<string[]>(['actualCost', 'predictedCost']);
  const [isGroupedData, setIsGroupedData] = useState(false);
  
  const { token } = useTinybirdToken();
  const inputRef = useRef<HTMLInputElement>(null);

  // Example queries that users can select
  const exampleQueries = [
    "What if we switch to Claude 3 Sonnet with a 10% volume increase?",
    "Predict costs if we get a 15% discount on GPT-4 for the next month",
    "How would costs change if we use Claude 3 Opus at $0.00003 per prompt token and $0.00015 per completion token?",
    "What if our usage increases by 25% next month?",
    "Compare current costs with GPT-4 for the last week",
    "Show me cost predictions grouped by provider for last month",
    "What would be our costs grouped by project if we switch to GPT-4?",
    "Filter by organization quantum_systems and show costs for last 3 months",
    "Predict costs for provider OpenAI in production environment",
    "What if we increase usage by 20% for the chatbot project?"
  ];

  // Add debugging for token
  useEffect(() => {
    console.log("Token available:", !!token);
  }, [token]);

  // Format date to YYYY-MM-DD HH:MM:SS format for Tinybird API
  const formatDateForTinybird = (dateStr: string): string => {
    // If the date already has time component, return as is
    if (dateStr.includes(' ') || dateStr.includes('T')) {
      return dateStr;
    }
    
    // Otherwise add time component (start of day for start_date, end of day for end_date)
    const isStartDate = dateStr === parameters?.start_date;
    return `${dateStr} ${isStartDate ? '00:00:00' : '23:59:59'}`;
  };

  // Add blur effect to the main content when modal is open
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      if (isOpen) {
        mainContent.classList.add('blur-sm', 'transition-all');
      } else {
        mainContent.classList.remove('blur-sm', 'transition-all');
      }
    }
    
    return () => {
      // Clean up when component unmounts
      if (mainContent) {
        mainContent.classList.remove('blur-sm', 'transition-all');
      }
    };
  }, [isOpen]);

  // Fetch usage data directly when parameters change
  useEffect(() => {
    console.log("Parameters changed:", parameters);
    
    async function fetchUsageData() {
      if (!parameters) {
        console.log("No parameters available, skipping fetch");
        return;
      }
      
      if (!token) {
        console.log("No token available, skipping fetch");
        return;
      }
      
      setIsLoadingUsage(true);
      console.log("Fetching usage data with parameters:", parameters);
      
      try {
        // Use the group_by parameter for column_name if available
        const columnName = parameters.group_by || 'model';
        
        // Build filters object with all possible filter parameters
        const filters: Record<string, string> = {
          ...currentFilters,
          start_date: formatDateForTinybird(parameters.start_date),
          end_date: formatDateForTinybird(parameters.end_date),
          column_name: columnName
        };
        
        // Add model filter if specified
        if (parameters.model) {
          filters.model = normalizeModelName(parameters.model);
        }
        
        // Add other filter parameters if specified
        const filterParams = ['organization', 'project', 'environment', 'provider', 'user'];
        filterParams.forEach(param => {
          const value = parameters[param as keyof CostParameters];
          if (value) {
            filters[param] = value as string;
          }
        });
        
        console.log("Fetching with filters:", filters);
        console.log("Token available for fetch:", !!token);
        console.log("Grouping by:", columnName);
        
        // Directly call the fetch function
        console.log("About to call fetchLLMUsage");
        const response = await fetchLLMUsage(token, filters);
        console.log("Fetch completed, response:", response);
        
        if (response && response.data && response.data.length > 0) {
          console.log("Data received, length:", response.data.length);
          setUsageData(response.data);
          calculateCosts(response.data, parameters);
        } else {
          console.log("No data received, using sample data");
          // Generate sample data if no real data is available
          const startDate = new Date(parameters.start_date);
          const endDate = new Date(parameters.end_date);
          const sampleData = generateSampleData(startDate, endDate, parameters.model);
          setUsageData(sampleData);
          calculateCosts(sampleData, parameters);
        }
      } catch (error) {
        console.error("Error fetching usage data:", error);
        // Generate sample data on error
        const startDate = new Date(parameters.start_date);
        const endDate = new Date(parameters.end_date);
        const sampleData = generateSampleData(startDate, endDate, parameters.model);
        setUsageData(sampleData);
        calculateCosts(sampleData, parameters);
      } finally {
        setIsLoadingUsage(false);
      }
    }
    
    fetchUsageData();
  }, [parameters, token, currentFilters]);

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
      console.log("Submitting query:", query);
      
      // Extract parameters from natural language query
      const response = await fetch('/api/extract-cost-parameters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract parameters');
      }
      
      const extractedParams = await response.json();
      console.log("Extracted parameters:", extractedParams);
      
      // Set parameters - this should trigger the useEffect
      setParameters(extractedParams);
      console.log("Parameters set in state");
      
    } catch (error) {
      console.error('Error generating prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const copyExample = (index: number, example: string) => {
    navigator.clipboard.writeText(example);
    setCopiedExample(index);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  const calculateCosts = (usageData: UsageDataItem[], params: CostParameters) => {
    // Add debugging
    console.log("Calculating costs with data:", usageData);
    console.log("Parameters:", params);
    
    // Default costs if not specified
    const promptCost = params.promptTokenCost ?? getDefaultPromptCost(params.model);
    const completionCost = params.completionTokenCost ?? getDefaultCompletionCost(params.model);
    const discount = params.discount / 100; // Convert percentage to decimal
    const volumeMultiplier = 1 + (params.volumeChange / 100); // Convert percentage to multiplier
    
    // If no data is available, generate sample data for demonstration
    let processedData = usageData;
    if (!usageData || usageData.length === 0) {
      console.log("No real data available, generating sample data");
      
      // Generate sample data for the date range
      const startDate = new Date(params.start_date);
      const endDate = new Date(params.end_date);
      processedData = generateSampleData(startDate, endDate, params.model);
      console.log("Generated sample data:", processedData);
    }
    
    // Check if we're grouping by a dimension
    const isGrouped = !!params.group_by && params.group_by !== 'model';
    
    if (isGrouped) {
      // Handle grouped data visualization
      processGroupedData(processedData, params);
    } else {
      // Handle regular data visualization (actual vs predicted)
      processRegularData(processedData, params);
    }
  };

  // New function to process grouped data
  const processGroupedData = (data: UsageDataItem[], params: CostParameters) => {
    // Group data by date and category
    const groupedByDate = new Map<string, Map<string, { 
      prompt_tokens: number, 
      completion_tokens: number, 
      cost: number 
    }>>();
    
    // Process each data point
    data.forEach(item => {
      const date = item.date;
      const category = item.category || 'unknown';
      
      if (!groupedByDate.has(date)) {
        groupedByDate.set(date, new Map());
      }
      
      const dateMap = groupedByDate.get(date)!;
      
      if (!dateMap.has(category)) {
        dateMap.set(category, {
          prompt_tokens: 0,
          completion_tokens: 0,
          cost: 0
        });
      }
      
      const categoryData = dateMap.get(category)!;
      categoryData.prompt_tokens += item.total_prompt_tokens || 0;
      categoryData.completion_tokens += item.total_completion_tokens || 0;
      categoryData.cost += item.total_cost || 0;
    });
    
    // Transform data for chart visualization
    const chartData: any[] = [];
    const categories = new Set<string>();
    
    // Collect all categories
    data.forEach(item => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    
    // Create chart data with all categories for each date
    Array.from(groupedByDate.entries()).forEach(([date, categoryMap]) => {
      const dateObj: any = {
        date: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit' 
        })
      };
      
      // Add data for each category
      Array.from(categories).forEach(category => {
        const categoryData = categoryMap.get(category);
        dateObj[category] = categoryData ? categoryData.cost : 0;
      });
      
      chartData.push(dateObj);
    });
    
    // Sort by date
    chartData.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log("Grouped chart data:", chartData);
    console.log("Categories:", Array.from(categories));
    
    // Set state for chart rendering
    setDailyCosts(chartData);
    setChartCategories(Array.from(categories));
    setIsGroupedData(true);
    
    // Calculate summary statistics
    const totalCost = chartData.reduce((sum, day) => {
      let daySum = 0;
      Array.from(categories).forEach(category => {
        daySum += day[category] || 0;
      });
      return sum + daySum;
    }, 0);
    
    // For grouped data, we don't have a predicted vs actual comparison
    setSummary({
      actualTotal: totalCost,
      predictedTotal: totalCost,
      difference: 0,
      percentChange: 0
    });
  };

  // Rename the existing calculation logic to processRegularData
  const processRegularData = (data: UsageDataItem[], params: CostParameters) => {
    // Group data by date
    const dateMap = new Map<string, DateAggregatedData>();
    
    // Log the structure of the first item to understand the data format
    if (data.length > 0) {
      console.log("Sample data item:", data[0]);
    }
    
    data.forEach(day => {
      // Ensure we have a valid date
      if (!day.date) {
        console.warn("Missing date in data item:", day);
        return;
      }
      
      const date = day.date;
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_cost: 0
        });
      }
      
      const entry = dateMap.get(date)!;
      // Make sure we're accessing the correct properties based on the API response
      entry.prompt_tokens += day.total_prompt_tokens || 0;
      entry.completion_tokens += day.total_completion_tokens || 0;
      entry.total_cost += day.total_cost || 0;
      
      // Log the accumulated values for debugging
      console.log(`Date ${date}: prompt=${entry.prompt_tokens}, completion=${entry.completion_tokens}, cost=${entry.total_cost}`);
    });
    
    // Calculate daily costs
    const dailyCostData = Array.from(dateMap.entries()).map(([date, data]) => {
      // Calculate actual cost from the data
      const actualCost = data.total_cost || 0;
      
      // Calculate predicted cost based on token usage and provided parameters
      const promptTokens = data.prompt_tokens || 0;
      const completionTokens = data.completion_tokens || 0;
      
      // Apply volume change if specified
      const adjustedPromptTokens = promptTokens * volumeMultiplier;
      const adjustedCompletionTokens = completionTokens * volumeMultiplier;
      
      // Calculate raw cost
      let predictedCost = (adjustedPromptTokens * promptCost) + 
                          (adjustedCompletionTokens * completionCost);
      
      // Apply discount if specified
      if (discount > 0) {
        predictedCost = predictedCost * (1 - discount);
      }
      
      console.log(`Calculated for ${date}: actual=${actualCost}, predicted=${predictedCost}`);
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit' 
        }),
        actualCost,
        predictedCost
      };
    });
    
    // Sort by date
    dailyCostData.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log("Final daily cost data:", dailyCostData);
    
    setDailyCosts(dailyCostData);
    setChartCategories(['actualCost', 'predictedCost']);
    setIsGroupedData(false);
    
    // Calculate summary statistics
    const actualTotal = dailyCostData.reduce((sum, day) => sum + day.actualCost, 0);
    const predictedTotal = dailyCostData.reduce((sum, day) => sum + day.predictedCost, 0);
    const difference = predictedTotal - actualTotal;
    const percentChange = actualTotal > 0 ? (difference / actualTotal) * 100 : 0;
    
    console.log("Summary:", { actualTotal, predictedTotal, difference, percentChange });
    
    setSummary({
      actualTotal,
      predictedTotal,
      difference,
      percentChange
    });
  };

  // Generate sample data for demonstration when no real data is available
  const generateSampleData = (startDate: Date, endDate: Date, model: string | null): UsageDataItem[] => {
    const sampleData: UsageDataItem[] = [];
    const currentDate = new Date(startDate);
    
    // Base token usage per day (randomized slightly for each day)
    const basePromptTokens = 100000;
    const baseCompletionTokens = 20000;
    
    // Base cost per token (use the default costs for the model)
    const promptCost = getDefaultPromptCost(model);
    const completionCost = getDefaultCompletionCost(model);
    
    // Generate data for each day in the range
    while (currentDate <= endDate) {
      // Add some randomness to make the data look realistic
      const randomFactor = 0.7 + Math.random() * 0.6; // Between 0.7 and 1.3
      
      const promptTokens = Math.round(basePromptTokens * randomFactor);
      const completionTokens = Math.round(baseCompletionTokens * randomFactor);
      
      // Calculate cost based on tokens
      const cost = (promptTokens * promptCost) + (completionTokens * completionCost);
      
      sampleData.push({
        date: currentDate.toISOString().split('T')[0],
        total_prompt_tokens: promptTokens,
        total_completion_tokens: completionTokens,
        total_cost: cost
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return sampleData;
  };

  // Helper function to get default costs for known models
  const getDefaultPromptCost = (model: string | null): number => {
    if (!model) return 0.0001; // Default fallback
    
    const costs: Record<string, number> = {
      'gpt-4': 0.00003,
      'gpt-4-turbo': 0.00001,
      'gpt-3.5-turbo': 0.000001,
      'claude-3-opus': 0.00001,
      'claude-3-sonnet': 0.000003,
      'claude-3-haiku': 0.000001,
    };
    
    // Convert model name to lowercase and handle variations
    const normalizedModel = model.toLowerCase();
    for (const [key, value] of Object.entries(costs)) {
      if (normalizedModel.includes(key)) {
        return value;
      }
    }
    
    return 0.0001; // Default if no match
  };
  
  const getDefaultCompletionCost = (model: string | null): number => {
    if (!model) return 0.0003; // Default fallback
    
    const costs: Record<string, number> = {
      'gpt-4': 0.00006,
      'gpt-4-turbo': 0.00003,
      'gpt-3.5-turbo': 0.000002,
      'claude-3-opus': 0.00003,
      'claude-3-sonnet': 0.000015,
      'claude-3-haiku': 0.000005,
    };
    
    // Convert model name to lowercase and handle variations
    const normalizedModel = model.toLowerCase();
    for (const [key, value] of Object.entries(costs)) {
      if (normalizedModel.includes(key)) {
        return value;
      }
    }
    
    return 0.0003; // Default if no match
  };

  // Add this function to normalize model names
  const normalizeModelName = (modelName: string | null): string | null => {
    if (!modelName) return null;
    
    // Convert to lowercase
    const normalized = modelName.toLowerCase()
      // Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // Remove any special characters
      .replace(/[^\w-]/g, '');
    
    // Map common variations to standard names
    const modelMap: Record<string, string> = {
      'claude3opus': 'claude-3-opus',
      'claude3sonnet': 'claude-3-sonnet',
      'claude3haiku': 'claude-3-haiku',
      'gpt4': 'gpt-4',
      'gpt35turbo': 'gpt-3.5-turbo'
    };
    
    // Check if we need to map this model name
    for (const [key, value] of Object.entries(modelMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }
    
    return normalized;
  };

  return (
    <>
      {isOpen && (
        <>
          {/* Modal backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-medium text-white">Cost Prediction</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Modal content */}
              <div className="p-4 overflow-y-auto flex-grow">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Sparkles className="h-4 w-4 text-blue-400" />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask about cost predictions..."
                      className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Examples dropdown */}
                  <div className="bg-gray-800/50 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setShowExamples(!showExamples)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:text-white"
                    >
                      <span>Example queries</span>
                      {showExamples ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    
                    {showExamples && (
                      <div className="px-4 pb-3 space-y-2">
                        {exampleQueries.map((example, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleExampleClick(example)}
                              className="flex-grow text-left text-sm text-blue-400 hover:text-blue-300 truncate"
                            >
                              {example}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyExample(index, example)}
                              className="flex-shrink-0 text-gray-400 hover:text-white"
                              title="Copy to clipboard"
                            >
                              {copiedExample === index ? (
                                <Check className="h-4 w-4 text-green-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      isLoading || !query.trim()
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Calculating...' : 'Calculate Prediction'}
                  </button>
                </form>
                
                {/* Results section */}
                {summary && (
                  <div className="mt-6 space-y-4">
                    {/* Summary cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Current Cost</div>
                        <div className="text-xl font-semibold text-white">${summary.actualTotal.toFixed(2)}</div>
                      </div>
                      
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Predicted Cost</div>
                        <div className="text-xl font-semibold text-white">${summary.predictedTotal.toFixed(2)}</div>
                      </div>
                      
                      <div className={`rounded-lg p-4 ${
                        summary.difference > 0 ? 'bg-red-900/50' : 'bg-green-900/50'
                      }`}>
                        <div className="text-sm text-gray-300 mb-1">Difference</div>
                        <div className="text-xl font-semibold text-white">
                          {summary.difference > 0 ? '+' : ''}${summary.difference.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-300">
                          {summary.difference > 0 ? '+' : ''}
                          {summary.percentChange.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Parameters and chart */}
                    <div className="space-y-4">
                      {/* Parameters */}
                      {parameters && (
                        <div className="bg-gray-800 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Prediction Parameters</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="text-gray-400">Model</div>
                            <div className="text-white">{parameters.model || 'Current models'}</div>
                            
                            <div className="text-gray-400">Prompt Token Cost</div>
                            <div className="text-white">${parameters.promptTokenCost || getDefaultPromptCost(parameters.model).toFixed(6)}</div>
                            
                            <div className="text-gray-400">Completion Token Cost</div>
                            <div className="text-white">${parameters.completionTokenCost || getDefaultCompletionCost(parameters.model).toFixed(6)}</div>
                            
                            {parameters.discount > 0 && (
                              <>
                                <div className="text-gray-400">Discount</div>
                                <div className="text-white">{parameters.discount}%</div>
                              </>
                            )}
                            
                            {parameters.volumeChange !== 0 && (
                              <>
                                <div className="text-gray-400">Volume Change</div>
                                <div className="text-white">{parameters.volumeChange > 0 ? '+' : ''}{parameters.volumeChange}%</div>
                              </>
                            )}
                            
                            <div className="text-gray-400">Time Period</div>
                            <div className="text-white">{parameters.timeframe}</div>
                            
                            <div className="text-gray-400">Date Range</div>
                            <div className="text-white">{parameters.start_date} to {parameters.end_date}</div>
                            
                            {parameters.group_by && (
                              <>
                                <div className="text-gray-400">Grouped By</div>
                                <div className="text-white">{parameters.group_by}</div>
                              </>
                            )}
                            
                            {/* Display filter parameters if specified */}
                            {parameters.organization && (
                              <>
                                <div className="text-gray-400">Organization</div>
                                <div className="text-white">{parameters.organization}</div>
                              </>
                            )}
                            
                            {parameters.project && (
                              <>
                                <div className="text-gray-400">Project</div>
                                <div className="text-white">{parameters.project}</div>
                              </>
                            )}
                            
                            {parameters.environment && (
                              <>
                                <div className="text-gray-400">Environment</div>
                                <div className="text-white">{parameters.environment}</div>
                              </>
                            )}
                            
                            {parameters.provider && (
                              <>
                                <div className="text-gray-400">Provider</div>
                                <div className="text-white">{parameters.provider}</div>
                              </>
                            )}
                            
                            {parameters.user && (
                              <>
                                <div className="text-gray-400">User</div>
                                <div className="text-white">{parameters.user}</div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Chart */}
                      {dailyCosts.length > 0 && (
                        <div className="bg-gray-800 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-2">
                            {isGroupedData 
                              ? `Cost Breakdown by ${parameters?.group_by || 'Category'}`
                              : 'Cost Comparison Over Time'}
                          </div>
                          
                          {isGroupedData ? (
                            // Stacked bar chart for grouped data
                            <BarChart
                              className="h-64"
                              data={dailyCosts}
                              index="date"
                              categories={chartCategories}
                              stack={true}
                              colors={["blue", "cyan", "amber", "green", "purple", "pink", "indigo", "rose"]}
                              valueFormatter={(value) => `$${value.toFixed(2)}`}
                              showLegend={true}
                              showGridLines={false}
                              showAnimation={true}
                            />
                          ) : (
                            // Area chart for regular comparison
                            <AreaChart
                              className="h-64"
                              data={dailyCosts}
                              index="date"
                              categories={chartCategories}
                              colors={["gray", "blue"]}
                              valueFormatter={(value) => `$${value.toFixed(2)}`}
                              showLegend={true}
                              showGridLines={false}
                              showAnimation={true}
                              customTooltip={(props) => (
                                <div className="bg-gray-900 p-2 rounded shadow-lg text-xs">
                                  <div className="font-medium text-white">{props.label}</div>
                                  {props.payload?.map((category, idx) => {
                                    // Cast the category to the correct type
                                    const typedCategory = category as unknown as ChartTooltipPayload;
                                    return (
                                      <div key={idx} className="flex items-center mt-1">
                                        <div 
                                          className="w-3 h-3 rounded-full mr-1" 
                                          style={{ backgroundColor: typedCategory.color }}
                                        />
                                        <span className="text-gray-300">
                                          {typedCategory.dataKey === 'actualCost' ? 'Actual' : 'Predicted'}: 
                                        </span>
                                        <span className="ml-1 text-white font-medium">
                                          ${Number(typedCategory.value).toFixed(2)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Loading indicator */}
                {isLoadingUsage && (
                  <div className="mt-4 p-3 bg-blue-900/20 text-blue-200 rounded-lg flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    Fetching usage data...
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