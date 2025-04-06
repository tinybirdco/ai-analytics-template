'use client';

import { Tab, TabGroup, TabList } from '@tremor/react';
import { useGenericCounter } from '@/hooks/useTinybirdData';
import { useSearchParams } from 'next/navigation';
import CustomBarList from './CustomBarList';
import { useState, useEffect } from 'react';
import { tabs } from '../constants';
import { useTinybirdToken } from '@/providers/TinybirdProvider';
import { 
  Server, 
  Cloud, 
  User, 
  Building2, 
  Cpu
} from 'lucide-react';

// CSS for hiding scrollbar
const noScrollbarStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Add style to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = noScrollbarStyle;
  document.head.appendChild(style);
}

// Custom OpenAI Icon
const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="#C6C6C6"/>
  </svg>
);

// Custom Anthropic Icon
const AnthropicIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-500">
    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" fill="#C6C6C6"/>
  </svg>
);

// Custom Google AI Icon
const GoogleAIIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#C6C6C6"/>
  </svg>
);

// Helper function to get icon for provider
const getProviderIcon = (provider: string) => {
  const lowerProvider = provider.toLowerCase();
  if (lowerProvider.includes('openai')) {
    return <OpenAIIcon />;
  } else if (lowerProvider.includes('anthropic')) {
    return <AnthropicIcon />;
  } else if (lowerProvider.includes('google')) {
    return <GoogleAIIcon />;
  } else {
    return <Cloud className="w-4 h-4 text-gray-500" />;
  }
};

// Helper function to get icon for model
const getModelIcon = (model: string) => {
  const lowerModel = model.toLowerCase();
  if (lowerModel.includes('gpt')) {
    return <OpenAIIcon />;
  } else if (lowerModel.includes('claude')) {
    return <AnthropicIcon />;
  } else if (lowerModel.includes('palm') || lowerModel.includes('gemini')) {
    return <GoogleAIIcon />;
  } else {
    return <Cpu className="w-4 h-4 text-gray-500" />;
  }
};

// Helper function to get icon for environment
const getEnvironmentIcon = (env: string) => {
  const lowerEnv = env.toLowerCase();
  if (lowerEnv.includes('prod')) {
    return <Server className="w-4 h-4 text-green-500" />;
  } else if (lowerEnv.includes('staging')) {
    return <Server className="w-4 h-4 text-yellow-500" />;
  } else if (lowerEnv.includes('dev')) {
    return <Server className="w-4 h-4 text-blue-500" />;
  } else {
    return <Server className="w-4 h-4 text-gray-500" />;
  }
};

interface TabbedPaneProps {
  filters: Record<string, string | undefined>;
  onFilterUpdate: (dimension: string, dimensionName: string, values: string[]) => void;
}

export default function TabbedPane({ filters, onFilterUpdate }: TabbedPaneProps) {
  const { orgName } = useTinybirdToken();
  const searchParams = useSearchParams();
  const filteredTabs = tabs.filter(tab => !orgName || tab.key !== 'organization');
  const initialDimension = searchParams.get('dimension') || filteredTabs[0].key;
  const [selectedTab, setSelectedTab] = useState<string>(initialDimension);
  const [barListData, setBarListData] = useState<Array<{ name: string; value: number; icon?: React.ReactNode }>>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // Create a copy of filters without the current dimension to avoid filtering by it
  const queryFilters = { ...filters };
  delete queryFilters[selectedTab];

  // Pass all filters to the query, but exclude the current dimension
  const { data, isLoading, error } = useGenericCounter(selectedTab, queryFilters as Record<string, string>);

  // Add effect to sync with URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramValue = params.get(selectedTab);
    if (paramValue) {
      setSelectedValues(paramValue.split(','));
    } else {
      setSelectedValues([]);
    }
  }, [selectedTab, searchParams]);

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedValues(newSelection);
    
    // Update URL without scroll
    const params = new URLSearchParams(searchParams.toString());
    if (newSelection.length > 0) {
      params.set(selectedTab, newSelection.join(','));
    } else {
      params.delete(selectedTab);
      if (filters[selectedTab]) {
        delete filters[selectedTab];
      }
    }
    window.history.replaceState({}, '', `?${params.toString()}`);
    
    // Notify parent to update filters
    onFilterUpdate(selectedTab, filteredTabs.find(t => t.key === selectedTab)?.name || selectedTab, newSelection);
  };

  const handleTabChange = (index: number) => {
    const tab = filteredTabs[index];
    const dimension = tab.key;
    
    // Update URL without scroll
    const params = new URLSearchParams(searchParams.toString());
    params.set('dimension', dimension);
    window.history.replaceState({}, '', `?${params.toString()}`);
    
    setSelectedTab(dimension);
  };

  // Update barListData when data changes
  useEffect(() => {
    if (data?.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newData = data.data.map((item: any) => {
        const name = item.category || 'Unknown';
        let icon;
        
        // Assign icon based on the selected tab
        switch (selectedTab) {
          case 'provider':
            icon = getProviderIcon(name);
            break;
          case 'model':
            icon = getModelIcon(name);
            break;
          case 'environment':
            icon = getEnvironmentIcon(name);
            break;
          case 'organization':
            icon = <Building2 className="w-4 h-4 text-gray-500" />;
            break;
          case 'user':
            icon = <User className="w-4 h-4 text-gray-500" />;
            break;
          default:
            icon = <Cloud className="w-4 h-4 text-gray-500" />;
        }
        
        return {
          name,
          value: item.total_cost || 0,
          icon
        };
      });
      setBarListData(newData);
    }
  }, [data, selectedTab]);

  return (
    <div className="h-full">
      <TabGroup 
        defaultIndex={filteredTabs.findIndex(t => t.key === selectedTab)}
        onIndexChange={handleTabChange}
      >
        <div 
          className="overflow-x-auto no-scrollbar"
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY;
            e.preventDefault();
          }}
        >
          <TabList className="flex min-w-max space-x-2">
            {filteredTabs.map((tab) => (
              <Tab
                key={tab.key}
                // @ts-expect-error fix later
                className={({ selected }) =>
                  `px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
                  ${selected 
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </TabList>
        </div>
        <div>
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error loading data</div>
          ) : (
            <CustomBarList 
              data={barListData}
              valueFormatter={(value: number) => `$${value.toLocaleString()}`}
              onSelectionChange={handleSelectionChange}
              initialSelectedItems={selectedValues}
            />
          )}
        </div>
      </TabGroup>
    </div>
  );
} 