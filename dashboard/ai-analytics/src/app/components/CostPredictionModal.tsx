// src/app/components/CostPredictionModal.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Sparkles, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { AreaChart, BarChart } from '@tremor/react';
import { useTinybirdToken } from '@/providers/TinybirdProvider';
import { fetchLLMUsage } from '@/services/tinybird';
import { useApiKeyStore } from '@/stores/apiKeyStore';
import CustomTooltip from './CustomTooltip';
import { useTrackEvent } from '@/hooks/useTrackEvent';

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
  actualCost?: number;
  predictedCost?: number;
  [category: string]: string | number | undefined; // Add index signature for dynamic properties
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

// Add default colors constant at the top level
const defaultColors = [
  '#27F795',  // 100% opacity
  '#27F795CC', // 80% opacity
  '#27F79599', // 60% opacity
  '#27F79566', // 40% opacity
  '#27F79533'  // 20% opacity
];

export default function CostPredictionModal({ 
  isOpen, 
  onClose,
  currentFilters
}: CostPredictionModalProps) {
  const track = useTrackEvent();

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
  const [showExamples, setShowExamples] = useState(true);
//   const [usageData, setUsageData] = useState<UsageDataItem[]>([]);
//   const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [chartCategories, setChartCategories] = useState<string[]>(['actualCost', 'predictedCost']);
  const [isGroupedData, setIsGroupedData] = useState(false);
  const [isPredictionQuery, setIsPredictionQuery] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const { token } = useTinybirdToken();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get the API key from the store
  const { openaiKey } = useApiKeyStore();

  // Example queries that users can select
  const exampleQueries = [
    "Show me cost for OpenAI provider by organization",
    "Filter by organization quantum_systems and show costs for last week",
    "Cost for OpenAI provider in production environment in last month group by model",
    "How would costs change if we use Claude 3 Opus at $0.00003 per prompt token and $0.00015 per completion token?"
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
      
    //   setIsLoadingUsage(true);
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
          const normalizedModel = normalizeModelName(parameters.model);
          if (normalizedModel) {
            filters.model = normalizedModel;
          }
        }
        
        // Add provider filter if specified
        if (parameters.provider) {
          const normalizedProvider = normalizeProviderName(parameters.provider);
          if (normalizedProvider) {
            filters.provider = normalizedProvider;
          }
        }
        
        // Add environment filter if specified
        if (parameters.environment) {
          const normalizedEnvironment = normalizeEnvironmentName(parameters.environment);
          if (normalizedEnvironment) {
            filters.environment = normalizedEnvironment;
          }
        }
        
        // Add other filter parameters if specified
        const otherFilterParams = ['organization', 'project', 'user'];
        otherFilterParams.forEach(param => {
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
        //   setUsageData(response.data);
          calculateCosts(response.data, parameters);
        } else {
          console.log("No data received, using sample data");
          // Generate sample data if no real data is available
          const startDate = new Date(parameters.start_date);
          const endDate = new Date(parameters.end_date);
          const sampleData = generateSampleData(startDate, endDate, parameters.model);
          // setUsageData(sampleData);
          calculateCosts(sampleData, parameters);
        }
      } catch (error) {
        console.error("Error fetching usage data:", error);
        // Generate sample data on error
        const startDate = new Date(parameters.start_date);
        const endDate = new Date(parameters.end_date);
        const sampleData = generateSampleData(startDate, endDate, parameters.model);
        // setUsageData(sampleData);
        calculateCosts(sampleData, parameters);
      } 
    //   finally {
    //     setIsLoadingUsage(false);
    //   }
    }
    
    fetchUsageData();
  }, [parameters, token, currentFilters]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard shortcuts and outside clicks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    // Add event listeners when the modal is open
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      
      // Clean up when the modal closes or component unmounts
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Create a memoized handler for backdrop clicks
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    // Ensure we're clicking the backdrop, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Check if API key is available
    if (!openaiKey) {
      // Show a message to the user that they need to provide an API key
      alert('Please provide your OpenAI API key in settings to use this feature.');
      return;
    }

    setIsLoading(true);

    track("submit_cost_prediction_query", {
      query: query,
    });

    try {
      console.log("Submitting query:", query);
      
      // Check if this is a prediction query
      const queryLower = query.toLowerCase();
      const isPrediction = queryLower.includes('predict') || 
                           queryLower.includes('what if') || 
                           queryLower.includes('would cost') ||
                           queryLower.includes('change if') ||
                           queryLower.includes('switch to');
      
      setIsPredictionQuery(isPrediction);
      
      // Extract parameters from natural language query
      const response = await fetch('/api/extract-cost-parameters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, apiKey: openaiKey }),
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

  const calculateButtonRef = useRef<HTMLButtonElement>(null);

  const handleExampleClick = (example: string) => {
    setQuery(example);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Use setTimeout to ensure the query state is updated before clicking the button
    setTimeout(() => {
      if (calculateButtonRef.current) {
        calculateButtonRef.current.click();
      }
    }, 0);
  };

  const calculateCosts = (usageData: UsageDataItem[], params: CostParameters) => {
    // Add debugging
    console.log("Calculating costs with data:", usageData);
    console.log("Parameters:", params);
    
    // Default costs if not specified
    // const promptCost = params.promptTokenCost ?? getDefaultPromptCost(params.model);
    // const completionCost = params.completionTokenCost ?? getDefaultCompletionCost(params.model);
    // const discount = params.discount / 100; // Convert percentage to decimal
    // const volumeMultiplier = 1 + (params.volumeChange / 100); // Convert percentage to multiplier
    
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
    
    // Check if we're grouping by any dimension (including model)
    const isGrouped = !!params.group_by;
    
    if (isGrouped) {
      // Handle grouped data visualization
      processGroupedData(processedData);
    } else {
      // Handle regular data visualization (actual vs predicted)
      processRegularData(processedData, params);
    }
  };

  // New function to process grouped data
  const processGroupedData = (data: UsageDataItem[]) => {
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
    const chartData: DailyCost[] = [];
    const categories = new Set<string>();
    
    // Collect all categories
    data.forEach(item => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    
    // Create chart data with all categories for each date
    Array.from(groupedByDate.entries()).forEach(([date, categoryMap]) => {
      const dateObj: DailyCost = {
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
    const total = chartData.reduce((sum, day) => {
      let daySum = 0;
      Array.from(categories).forEach(category => {
        // Convert to number and use 0 as fallback
        const value = typeof day[category] === 'number' ? day[category] as number : 0;
        daySum += value;
      });
      return sum + daySum;
    }, 0);
    
    // For grouped data, we don't have a predicted vs actual comparison
    setSummary({
      actualTotal: total,
      predictedTotal: total,
      difference: 0,
      percentChange: 0
    });
  };

  // Rename the existing calculation logic to processRegularData
  const processRegularData = (data: UsageDataItem[], params: CostParameters) => {
    // Group data by date
    const dateMap = new Map<string, DateAggregatedData>();
    
    // Get cost parameters
    const promptCost = params.promptTokenCost ?? getDefaultPromptCost(params.model);
    const completionCost = params.completionTokenCost ?? getDefaultCompletionCost(params.model);
    const discount = params.discount / 100; // Convert percentage to decimal
    const volumeMultiplier = 1 + (params.volumeChange / 100); // Define volumeMultiplier here
    
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
    const dailyCostData: DailyCost[] = Array.from(dateMap.entries()).map(([date, data]) => {
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
    const actualTotal = dailyCostData.reduce((sum, day) => sum + (day.actualCost || 0), 0);
    const predictedTotal = dailyCostData.reduce((sum, day) => sum + (day.predictedCost || 0), 0);
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

  // Add a function to normalize model names
  const normalizeModelName = (modelName: string | null): string | null => {
    if (!modelName) return null;
    
    // Convert to lowercase
    const normalized = modelName.toLowerCase();
    
    // Map common variations to standard names
    if (normalized.includes('gpt-4')) return 'gpt-4';
    if (normalized.includes('gpt-3.5')) return 'gpt-3.5-turbo';
    if (normalized.includes('claude-3-opus')) return 'claude-3-opus';
    if (normalized.includes('claude-3-sonnet')) return 'claude-3-sonnet';
    if (normalized.includes('claude-3-haiku')) return 'claude-3-haiku';
    
    return normalized;
  };

  // Add a function to normalize provider names
  const normalizeProviderName = (providerName: string | null): string | null => {
    if (!providerName) return null;
    
    // Convert to lowercase
    const normalized = providerName.toLowerCase();
    
    // Map common variations to standard names
    if (normalized.includes('openai')) return 'openai';
    if (normalized.includes('anthropic')) return 'anthropic';
    if (normalized.includes('cohere')) return 'cohere';
    if (normalized.includes('mistral')) return 'mistral';
    if (normalized.includes('google')) return 'google';
    if (normalized.includes('meta')) return 'meta';
    
    return normalized;
  };

  // Add a function to normalize environment names
  const normalizeEnvironmentName = (envName: string | null): string | null => {
    if (!envName) return null;
    
    // Convert to lowercase
    const normalized = envName.toLowerCase();
    
    // Map common variations to standard names
    if (normalized.includes('prod')) return 'production';
    if (normalized.includes('dev')) return 'development';
    if (normalized.includes('stag')) return 'staging';
    if (normalized.includes('test')) return 'testing';
    
    return normalized;
  };

  return (
    <>
      {isOpen && (
        <>
          {/* Modal backdrop - updated to use the memoized handler */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 font-['Roboto']"
            onClick={handleBackdropClick}
          />
          
          {/* Modal container */}
          <div 
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick} // Also handle clicks on the container outside the modal
          >
            <div 
              className="bg-[#262626] w-full max-w-3xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()} // Prevent clicks on the modal itself from closing it
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 pb-0">
                <div className="flex items-center space-x-2">
                  <h2 className="title-font">Cost Calculator</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="settings-button"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              
              {/* Modal content */}
              <div className="p-4 overflow-y-auto flex-grow !pb-0">
                <form onSubmit={handleSubmit} className="flex flex-col">
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ask AI..."
                        className="w-full h-[48px] px-4 pr-12 py-2 bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle focus:outline-none focus:ring-1 focus:ring-white placeholder:text-tremor-content dark:placeholder:text-dark-tremor-content placeholder:text-sm font-['Roboto'] dark:placeholder:text-[#8D8D8D]"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                      />
                      <button
                        type="submit"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-white hover:text-white pr-4"
                      >
                        <Sparkles className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    
                    {/* Examples dropdown */}
                    <div className="bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle pb-2">
                      <button
                        type="button"
                        onClick={() => setShowExamples(!showExamples)}
                        className="w-full flex items-center justify-between px-4 py-2 pt-4 text-sm text-gray-300 hover:text-white"
                      >
                        <span className="small-font">Example queries</span>
                        {showExamples ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      {showExamples && (
                        <div className="px-4 pb-4 space-y-2">
                          {exampleQueries.map((example, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleExampleClick(example)}
                                className="flex-grow text-left default-font hover:text-[var(--accent)] truncate"
                              >
                                {example}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Parameters and chart */}
                    <div className="font-['Roboto']">
                      {parameters && (
                        <>
                          {/* Collapsible header and parameters */}
                          <button
                            onClick={() => setShowDetails(!showDetails)}
                            className={`w-full flex items-center justify-between default-font ${
                              showDetails ? 'text-[var(--accent)] !pb-0' : ''
                            }`}
                          >
                            <div className={`flex items-center gap-2 pt-4 pb-4 ${
                              showDetails ? 'hover:text-[var(--accent)] !pb-0' : ''
                            }`}>
                              {showDetails ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Info className="h-4 w-4" />
                              )}
                              <span className="text-sm">{showDetails ? 'Hide details' : 'Show details'}</span>
                            </div>
                          </button>

                          {/* Parameters (collapsible) */}
                          {showDetails && (
                            <div>
                              <div className="p-6 pt-0 default-font">
                                <h4 className="mb-4">Parameters</h4>
                                <div className="grid grid-cols-[150px_1fr] gap-x-4 gap-y-4">
                                  <div>Model</div>
                                  <div>{parameters.model || 'Current models'}</div>
                                  
                                  <div>Prompt Token Cost</div>
                                  <div className="font-['Roboto Mono']">${parameters.promptTokenCost || getDefaultPromptCost(parameters.model).toFixed(6)}</div>
                                  
                                  <div>Completion Token Cost</div>
                                  <div className="font-['Roboto Mono']">${parameters.completionTokenCost || getDefaultCompletionCost(parameters.model).toFixed(6)}</div>
                                  
                                  {parameters.discount > 0 && (
                                    <>
                                      <div>Discount</div>
                                      <div className="font-['Roboto Mono']">{parameters.discount}%</div>
                                    </>
                                  )}
                                  
                                  {parameters.volumeChange !== 0 && (
                                    <>
                                      <div>Volume Change</div>
                                      <div className="font-['Roboto Mono']">{parameters.volumeChange > 0 ? '+' : ''}{parameters.volumeChange}%</div>
                                    </>
                                  )}
                                  
                                  <div>Time Period</div>
                                  <div className="font-['Roboto Mono']">{parameters.timeframe}</div>
                                  
                                  <div>Date Range</div>
                                  <div className="font-['Roboto Mono']">{parameters.start_date} to {parameters.end_date}</div>
                                  
                                  {parameters.group_by && (
                                    <>
                                      <div>Grouped By</div>
                                      <div>{parameters.group_by}</div>
                                    </>
                                  )}
                                  
                                  {/* Display filter parameters if specified */}
                                  {parameters.organization && (
                                    <>
                                      <div>Organization</div>
                                      <div>{parameters.organization}</div>
                                    </>
                                  )}
                                  
                                  {parameters.project && (
                                    <>
                                      <div>Project</div>
                                      <div>{parameters.project}</div>
                                    </>
                                  )}
                                  
                                  {parameters.environment && (
                                    <>
                                      <div>Environment</div>
                                      <div>{parameters.environment}</div>
                                    </>
                                  )}
                                  
                                  {parameters.provider && (
                                    <>
                                      <div>Provider</div>
                                      <div>{parameters.provider}</div>
                                    </>
                                  )}
                                  
                                  {parameters.user && (
                                    <>
                                      <div>User</div>
                                      <div>{parameters.user}</div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Chart (always visible when parameters exist) */}
                          {dailyCosts.length > 0 && (
                            <div className="mt-4">
                              {/* Legend section */}
                              <h2 className="text-tremor-metric-xl">{summary ? `$${summary.actualTotal.toFixed(6)}` : 'N/A'}</h2>
                              <ul className="flex flex-wrap gap-8 mb-8 mt-6">
                                {isPredictionQuery ? (
                                  // Legend for prediction query
                                  <>
                                    <li>
                                      <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 bg-[#27F795] shrink-0" />
                                        <p className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-['Roboto Mono']">
                                          ${summary?.actualTotal.toFixed(6)}
                                        </p>
                                      </div>
                                      <p className="text-xs text-[#C6C6C6] whitespace-nowrap mt-2 ml-6">
                                        Actual
                                      </p>
                                    </li>
                                    <li>
                                      <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 bg-[#3CCC70] shrink-0" />
                                        <p className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-['Roboto Mono']">
                                          ${summary?.predictedTotal.toFixed(6)}
                                        </p>
                                      </div>
                                      <p className="text-xs text-[#C6C6C6] whitespace-nowrap mt-2 ml-6">
                                        Predicted
                                      </p>
                                    </li>
                                  </>
                                ) : isGroupedData ? (
                                  // Legend for grouped data
                                  chartCategories.map((category, index) => {
                                    const total = dailyCosts.reduce((sum, day) => 
                                      sum + (typeof day[category] === 'number' ? day[category] as number : 0), 0
                                    );
                                    return (
                                      <li key={category}>
                                        <div className="flex items-center gap-2">
                                          <span 
                                            className="w-4 h-4 shrink-0"
                                            style={{ backgroundColor: defaultColors[index % defaultColors.length] }}
                                          />
                                          <p className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-['Roboto Mono']">
                                            ${total.toFixed(6)}
                                          </p>
                                        </div>
                                        <p className="text-xs text-[#C6C6C6] whitespace-nowrap mt-2 ml-6">
                                          {category}
                                        </p>
                                      </li>
                                    );
                                  })
                                ) : (
                                  // Legend for single metric
                                  <li>
                                    <div className="flex items-center gap-2">
                                      <span className="w-4 h-4 bg-[#27F795] shrink-0" />
                                      <p className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-['Roboto Mono']">
                                        ${summary?.actualTotal.toFixed(6)}
                                      </p>
                                    </div>
                                    <p className="text-xs text-[#C6C6C6] whitespace-nowrap mt-2 ml-6">
                                      Total Cost
                                    </p>
                                  </li>
                                )}
                              </ul>
                              
                              {isPredictionQuery ? (
                                // Dual area chart for predictions
                                <AreaChart
                                  className="h-72"
                                  data={dailyCosts}
                                  index="date"
                                  categories={['actualCost', 'predictedCost']}
                                  colors={defaultColors}
                                  valueFormatter={(value) => `$${value.toFixed(6)}`}
                                  showLegend={false}
                                  showGridLines={false}
                                  showAnimation={true}
                                  curveType="monotone"
                                  customTooltip={(props) => (
                                    <CustomTooltip
                                      date={props.payload?.[0]?.payload.date}
                                      unit="$"
                                      entries={props.payload?.map(entry => ({
                                        name: entry.name === 'actualCost' ? 'Actual' : 'Predicted',
                                        value: Array.isArray(entry.value) ? entry.value[0] || 0 : entry.value || 0,
                                        color: entry.color || defaultColors[0]
                                      })) || []}
                                    />
                                  )}
                                />
                              ) : isGroupedData ? (
                                // Stacked bar chart for grouped data
                                <BarChart
                                  className="h-72"
                                  data={dailyCosts}
                                  index="date"
                                  categories={chartCategories}
                                  colors={defaultColors}
                                  valueFormatter={(value) => `$${value.toFixed(6)}`}
                                  stack={true}
                                  showLegend={false}
                                  showGridLines={false}
                                  showAnimation={true}
                                  customTooltip={(props) => (
                                    <CustomTooltip
                                      date={props.payload?.[0]?.payload.date}
                                      unit="$"
                                      entries={props.payload?.map(entry => ({
                                        name: String(entry.name),
                                        value: Array.isArray(entry.value) ? entry.value[0] || 0 : entry.value || 0,
                                        color: entry.color || defaultColors[0]
                                      })) || []}
                                    />
                                  )}
                                />
                              ) : (
                                // Single area chart for regular cost analysis
                                <AreaChart
                                  className="h-72"
                                  data={dailyCosts}
                                  index="date"
                                  categories={['actualCost']}
                                  colors={[defaultColors[0]]}
                                  valueFormatter={(value) => `$${value.toFixed(6)}`}
                                  showLegend={false}
                                  showGridLines={false}
                                  showAnimation={true}
                                  curveType="monotone"
                                  customTooltip={(props) => (
                                    <CustomTooltip
                                      date={props.payload?.[0]?.payload.date}
                                      unit="$"
                                      entries={props.payload?.map(entry => ({
                                        name: 'Cost',
                                        value: Array.isArray(entry.value) ? entry.value[0] || 0 : entry.value || 0,
                                        color: entry.color || defaultColors[0]
                                      })) || []}
                                    />
                                  )}
                                />
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="-mx-4 mt-4"> {/* Changed pt-4 to mt-4 */}
                    <button
                      ref={calculateButtonRef}
                      type="submit"
                      disabled={isLoading || !query.trim()}
                      className={`w-full py-4 transition-colors ${
                        isLoading || !query.trim()
                          ? 'bg-[var(--accent)] button-font cursor-not-allowed'
                          : 'bg-[var(--accent)] button-font text-white hover:bg-[var(--hover-accent)] hover:text-white'
                      }`}
                    >
                      {isLoading ? 'Calculating...' : 'Calculate Cost'}
                    </button>
                  </div>
                </form>
                
                {/* Results section */}
                {summary && (
                  <div className="mt-6 space-y-4">
                    {/* Summary cards */}
                    {/* <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Current Cost</div>
                      <div className="text-xl font-semibold text-white">${summary.actualTotal.toFixed(6)}</div>
                    </div> */}
                    
                    {/* <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Predicted Cost</div>
                      <div className="text-xl font-semibold text-white">${summary.predictedTotal.toFixed(6)}</div>
                    </div> */}
                    
                    {/* <div className={`rounded-lg p-4 ${
                      summary.difference > 0 ? 'bg-red-900/50' : 'bg-green-900/50'
                    }`}>
                      <div className="text-sm text-gray-300 mb-1">Difference</div>
                      <div className="text-xl font-semibold text-white">
                        {summary.difference > 0 ? '+' : ''}${summary.difference.toFixed(6)}
                      </div>
                      <div className="text-sm text-gray-300">
                        {summary.difference > 0 ? '+' : ''}
                        {summary.percentChange.toFixed(1)}%
                      </div>
                    </div> */}
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