'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@tremor/react';
import { format } from 'date-fns';
import { X, User, Cloud, Settings, Check } from 'lucide-react';
import { useLLMMessages } from '@/hooks/useTinybirdData';
import { Dialog, DialogPanel } from '@tremor/react';

// Define the shape of the LLM message data
interface LLMMessage {
  timestamp: string;
  organization: string;
  project: string;
  environment: string;
  user: string;
  chat_id: string;
  message_id?: string;
  model: string;
  provider: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  duration: number;
  cost: number;
  response_status: string;
  exception: string | null;
  similarity?: number;
  messages?: string[];
  response_choices?: string[];
}

interface DataTableProps {
  data?: { data: LLMMessage[] };
  isLoading?: boolean;
  searchHighlight?: string | null;
}

// Define column configuration
interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  width?: string;
}

// Default column configuration
const defaultColumns: ColumnConfig[] = [
  { id: 'timestamp', label: 'Timestamp', visible: true, width: '160px' },
  { id: 'model', label: 'Model', visible: true, width: '120px' },
  { id: 'cost', label: 'Cost', visible: true, width: '100px' },
  { id: 'response_status', label: 'Status', visible: true, width: '100px' },
  { id: 'provider', label: 'Provider', visible: true, width: '120px' },
  { id: 'duration', label: 'Duration', visible: true, width: '100px' },
  { id: 'total_tokens', label: 'Total Tokens', visible: true, width: '120px' },
  { id: 'user', label: 'User', visible: false, width: '150px' },
  { id: 'organization', label: 'Organization', visible: false, width: '150px' },
  { id: 'project', label: 'Project', visible: false, width: '150px' },
  { id: 'prompt_tokens', label: 'Prompt Tokens', visible: false, width: '120px' },
  { id: 'completion_tokens', label: 'Completion Tokens', visible: false, width: '140px' },
];

// Mock data for development and testing
const MOCK_DATA = {
  data: [
    {
      timestamp: '2024-01-01T12:00:00',
      organization: 'Acme Inc',
      project: 'chatbot',
      environment: 'production',
      user: 'john@acme.com',
      chat_id: 'chat_123',
      model: 'gpt-4',
      provider: 'OpenAI',
      prompt_tokens: 10000,
      completion_tokens: 5000,
      total_tokens: 15000,
      duration: 250.5,
      cost: 0.12,
      response_status: 'success',
      exception: null
    },
    // More mock data entries...
  ]
};

// Custom OpenAI Icon
const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#C6C6C6]">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="currentColor"/>
  </svg>
);

// Custom Anthropic Icon
const AnthropicIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#C6C6C6]">
    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" fill="currentColor"/>
  </svg>
);

// Custom Google AI Icon
const GoogleAIIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#C6C6C6]">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"/>
  </svg>
);

// Detail view component
function DetailView({ message, onClose }: { message: LLMMessage, onClose: () => void }) {
  const { data: chatData, isLoading } = useLLMMessages({
    chat_id: message.chat_id,
    message_id: message.message_id
  });

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
      return <Cloud className="w-4 h-4 text-[#C6C6C6]" />;
    }
  };

  // Parse messages from JSON string if needed
  const parseMessages = (msg: LLMMessage) => {
    if (typeof msg.messages === 'string') {
      try {
        return JSON.parse(msg.messages);
      } catch (e) {
        console.error('Failed to parse messages:', e);
        return [];
      }
    }
    return msg.messages || [];
  };

  // Parse response choices from JSON string
  const parseResponseChoices = (msg: LLMMessage) => {
    if (!msg.response_choices || msg.response_status !== 'success') return [];
    
    if (typeof msg.response_choices === 'string') {
      try {
        return JSON.parse(msg.response_choices);
      } catch {
        try {
          // Handle case where response_choices is an array of JSON strings
          return (msg.response_choices as unknown as string[]).map(choice => JSON.parse(choice));
        } catch (e2) {
          console.error('Failed to parse response choices:', e2);
          return [];
        }
      }
    }
    return msg.response_choices;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-1/3 bg-[#262626] z-50 overflow-auto transition-transform duration-300 transform translate-x-0 font-['Roboto']">
      <div className="p-4 flex justify-between items-center sticky top-0 bg-[#262626] z-10">
        <h2 className="title-font">Conversation Details</h2>
        <button 
          onClick={onClose}
          className="settings-button"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>
      
      <div className="p-4 space-y-4 default-font">
          <div>Message Info</div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div className=" text-left truncate">Model</div>
            <div className=" text-right truncate">{message.model}</div>
            
            <div className=" text-left truncate">Provider</div>
            <div className=" text-right truncate">{message.provider}</div>
            
            <div className=" text-left truncate">Organization</div>
            <div className=" text-right truncate">{message.organization}</div>
            
            <div className=" text-left truncate">Project</div>
            <div className=" text-right truncate">{message.project}</div>
            
            <div className=" text-left truncate">User</div>
            <div className=" text-right truncate">{message.user}</div>
            
            <div className=" text-left truncate">Timestamp</div>
            <div className=" text-right truncate font-['Roboto_Mono']">
              {format(new Date(message.timestamp), 'MMM d, yyyy HH:mm:ss')}
            </div>
            
            <div className=" text-left truncate">Prompt Tokens</div>
            <div className=" text-right truncate font-['Roboto_Mono']">
              {message.prompt_tokens.toLocaleString()}
            </div>
            
            <div className=" text-left truncate">Completion Tokens</div>
            <div className=" text-right truncate font-['Roboto_Mono']">
              {message.completion_tokens.toLocaleString()}
            </div>
            
            <div className=" text-left truncate">Total Tokens</div>
            <div className=" text-right truncate font-['Roboto_Mono']">
              {message.total_tokens.toLocaleString()}
            </div>
            
            <div className=" text-left truncate">Duration</div>
            <div className=" text-right truncate font-['Roboto_Mono']">
              {message.duration.toFixed(4)}s
            </div>
            
            <div className=" text-left truncate">Cost</div>
            <div className=" text-right truncate font-['Roboto_Mono']">
              ${message.cost.toFixed(6)}
            </div>
            
            <div className=" text-left truncate">Status</div>
            <div className=" text-right">
              <span className={`px-2 py-1 rounded-full text-xs ${
                message.response_status === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message.response_status}
              </span>
            </div>
            
            {message.similarity !== undefined && (
              <>
                <div className=" text-left truncate">Similarity</div>
                <div className=" text-right">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-['Roboto_Mono']">
                    {(message.similarity * 100).toFixed(0)}%
                  </span>
                </div>
              </>
            )}
          </div>
        
        <div className="pt-12">
          <h2 className="title-font pb-6">Conversation</h2>
          
          {isLoading ? (
            <div className="text-center py-8 ">Loading conversation...</div>
          ) : (
            <div className="space-y-4">
              {chatData?.data && chatData.data.length > 0 ? (
                chatData.data.map((msg: LLMMessage, idx: number) => {
                  const messages = parseMessages(msg);
                  
                  if (messages && messages.length > 0) {
                    return (
                      <div key={idx} className="space-y-6">
                        {messages.map((chatMsg: { role: string; content: string }, msgIdx: number) => (
                          <div key={`${idx}-${msgIdx}`} className={`${chatMsg.role === 'assistant' ? 'pl-6' : ''}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {chatMsg.role === 'system' && (
                                <div className="w-4 h-4 rounded-full bg-[#353535] flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-[#C6C6C6]" />
                                </div>
                              )}
                              {chatMsg.role === 'user' && (
                                <User className="w-4 h-4 text-[#C6C6C6]" />
                              )}
                              {chatMsg.role === 'assistant' && (
                                getProviderIcon(msg.provider)
                              )}
                              <span className="text-xs text-[#C6C6C6] capitalize">{chatMsg.role}</span>
                            </div>
                            <div className="ml-6 text-[#F4F4F4] whitespace-pre-wrap">{chatMsg.content}</div>
                          </div>
                        ))}
                        
                        {msg.response_status === 'success' && parseResponseChoices(msg).length > 1 && (
                          <div className="mt-4 space-y-3">
                            <div className="text-sm ">Alternative Responses:</div>
                            <div className="space-y-3">
                              {parseResponseChoices(msg).slice(1).map((choice: { message?: { content: string }; content?: string }, choiceIdx: number) => (
                                <div key={`choice-${choiceIdx}`} className="bg-gray-700 rounded-lg p-3">
                                  <div className="text-xs  mb-1.5">Alternative {choiceIdx + 1}</div>
                                  <div className=" whitespace-pre-wrap">
                                    {choice.message?.content || choice.content || JSON.stringify(choice)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <div key={idx}>
                      {msg.response_status !== 'success' && msg.exception && (
                        <div className="bg-red-900 rounded-lg p-3">
                          <div className="text-xs text-red-400 mb-1.5">Error</div>
                          <div className="text-red-200 whitespace-pre-wrap">{msg.exception}</div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 ">No conversation data available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DataTable({ 
  data = MOCK_DATA, 
  isLoading = false,
  searchHighlight = null 
}: DataTableProps) {
  const [selectedMessage, setSelectedMessage] = useState<LLMMessage | null>(null);
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    setColumns(prevColumns => 
      prevColumns.map(col => 
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Reset columns to default
  const resetColumns = () => {
    setColumns(defaultColumns);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading messages...</div>
      </div>
    );
  }

  const handleRowClick = (message: LLMMessage) => {
    setSelectedMessage(message);
  };

  const handleCloseDetail = () => {
    setSelectedMessage(null);
  };

  // Get visible columns
  const visibleColumns = columns.filter(col => col.visible);
  
  // Add relevance column if searchHighlight is present
  const allVisibleColumns = searchHighlight 
    ? [...visibleColumns, { id: 'similarity', label: 'Relevance', visible: true, width: '100px' }]
    : visibleColumns;

  return (
    <div className="flex flex-col h-full relative">
      {/* Content container without blur */}
      <div className="flex-1 overflow-auto min-h-0 bg-[#0A0A0A] group">
        <div className="min-w-[800px]">
          <Table className="font-['Roboto'] text-[#F4F4F4]">
            <TableHead className="sticky top-0 z-10">
              <TableRow>
                {allVisibleColumns.map(column => (
                  <TableHeaderCell 
                    key={column.id} 
                    className="text-[#F4F4F4]"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data && data.data.length > 0 ? (
                data.data.map((item, idx) => (
                  <TableRow 
                    key={idx}
                    onClick={() => handleRowClick(item)}
                    className="cursor-pointer hover:bg-tremor-brand-emphasis dark:hover:bg-dark-tremor-brand-emphasis text-[#F4F4F4] transition-colors"
                  >
                    {allVisibleColumns.map(column => {
                      // Render cell based on column type
                      switch (column.id) {
                        case 'timestamp':
                          return (
                            <TableCell key={column.id}>
                              {format(new Date(item.timestamp), 'MMM d, yyyy HH:mm:ss')}
                            </TableCell>
                          );
                        case 'cost':
                          return (
                            <TableCell key={column.id}>
                              ${item.cost.toFixed(6)}
                            </TableCell>
                          );
                        case 'duration':
                          return (
                            <TableCell key={column.id}>
                              {item.duration.toFixed(4)}
                            </TableCell>
                          );
                        case 'response_status':
                          return (
                            <TableCell key={column.id}>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                item.response_status === 'success' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.response_status}
                              </span>
                            </TableCell>
                          );
                        case 'similarity':
                          return (
                            <TableCell key={column.id}>
                              {item.similarity ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  {(item.similarity * 100).toFixed(0)}%
                                </span>
                              ) : '-'}
                            </TableCell>
                          );
                        case 'prompt_tokens':
                        case 'completion_tokens':
                        case 'total_tokens':
                          return (
                            <TableCell key={column.id}>
                              {item[column.id].toLocaleString()}
                            </TableCell>
                          );
                        default:
                          return (
                            <TableCell key={column.id}>
                              {item[column.id as keyof LLMMessage]?.toString() || '-'}
                            </TableCell>
                          );
                      }
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={allVisibleColumns.length} className="text-center">
                    No messages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Settings button in the bottom-right corner, only visible on hover */}
        <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setIsColumnSettingsOpen(true)}
            className="settings-button"
            aria-label="Column settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Semi-transparent overlay */}
      {selectedMessage && (
        <div 
          className="fixed inset-0 bg-[#0A0A0A] bg-opacity-80 z-40"
          onClick={handleCloseDetail}
        />
      )}
      
      {/* Detail View */}
      {selectedMessage && (
        <DetailView 
          message={selectedMessage} 
          onClose={handleCloseDetail} 
        />
      )}

      {/* Column Settings Dialog */}
      <Dialog
        open={isColumnSettingsOpen}
        onClose={() => setIsColumnSettingsOpen(false)}
        static={true}
        className="z-[100]"
      >
        <div className="fixed inset-0 bg-[#0A0A0A] bg-opacity-80" />
        <DialogPanel className="!bg-[#262626] flex flex-col relative z-10 rounded-none p-0 font-['Roboto']" style={{ width: '400px', minWidth: '400px' }}>
          <div className="flex items-center justify-between p-4 pb-0">
            <h2 className="title-font">Column Settings</h2>
            <button 
              onClick={() => setIsColumnSettingsOpen(false)}
              className="settings-button"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
          
          <div className="p-4 pt-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-[#C6C6C6]">Select columns to display</span>
              <button
                onClick={resetColumns}
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Reset to default
              </button>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {columns.map(column => (
                <div key={column.id} className="flex items-center justify-between py-2">
                  <span className="text-[#F4F4F4]">{column.label}</span>
                  <button
                    onClick={() => toggleColumnVisibility(column.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center ${
                      column.visible 
                        ? 'border-[var(--accent)] bg-[var(--accent)]' 
                        : 'border-[#C6C6C6]'
                    }`}
                  >
                    {column.visible && <Check className="h-3 w-3 text-[rgb(10,10,10)]" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}