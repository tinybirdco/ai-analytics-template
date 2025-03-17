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
import { X } from 'lucide-react';
import { useLLMMessages } from '@/hooks/useTinybirdData';

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

// Detail view component
function DetailView({ message, onClose }: { message: LLMMessage, onClose: () => void }) {
  const { data: chatData, isLoading } = useLLMMessages({
    chat_id: message.chat_id,
    message_id: message.message_id
  });

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
      } catch (e) {
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
    <div className="fixed inset-y-0 right-0 w-1/3 bg-gray-800 shadow-xl z-50 overflow-auto transition-transform duration-300 transform translate-x-0">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Conversation Details</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
        >
          <X className="h-6 w-6 text-gray-400" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-6 bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Message Info</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-400">Model</div>
            <div className="text-white">{message.model}</div>
            
            <div className="text-gray-400">Provider</div>
            <div className="text-white">{message.provider}</div>
            
            <div className="text-gray-400">Organization</div>
            <div className="text-white">{message.organization}</div>
            
            <div className="text-gray-400">Project</div>
            <div className="text-white">{message.project}</div>
            
            <div className="text-gray-400">User</div>
            <div className="text-white">{message.user}</div>
            
            <div className="text-gray-400">Timestamp</div>
            <div className="text-white">{format(new Date(message.timestamp), 'MMM d, yyyy HH:mm:ss')}</div>
            
            <div className="text-gray-400">Total Tokens</div>
            <div className="text-white">{message.total_tokens.toLocaleString()}</div>
            
            <div className="text-gray-400">Duration</div>
            <div className="text-white">{message.duration.toFixed(2)}s</div>
            
            <div className="text-gray-400">Cost</div>
            <div className="text-white">${message.cost.toFixed(4)}</div>
            
            <div className="text-gray-400">Status</div>
            <div className="text-white">
              <span className={`px-2 py-1 rounded-full text-xs ${
                message.response_status === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message.response_status}
              </span>
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-white mb-2">Conversation</h3>
        
        {isLoading ? (
          <div className="text-center py-4 text-gray-400">Loading conversation...</div>
        ) : (
          <div className="space-y-4">
            {chatData?.data && chatData.data.length > 0 ? (
              chatData.data.map((msg: LLMMessage, idx: number) => {
                const messages = parseMessages(msg);
                
                // If we have structured messages, render those
                if (messages && messages.length > 0) {
                  return (
                    <div key={idx} className="space-y-2">
                      {messages.map((chatMsg: any, msgIdx: number) => (
                        <div key={`${idx}-${msgIdx}`} className={`rounded-lg p-3 text-white ${
                          chatMsg.role === 'user' ? 'bg-gray-700' : 
                          chatMsg.role === 'assistant' ? 'bg-blue-900' : 
                          'bg-purple-900'
                        }`}>
                          <div className="text-xs text-gray-400 mb-1 capitalize">{chatMsg.role}</div>
                          <div className="whitespace-pre-wrap">{chatMsg.content}</div>
                        </div>
                      ))}
                      
                      {/* Show alternative responses if available */}
                      {msg.response_status === 'success' && (
                        <>
                          {parseResponseChoices(msg).length > 1 && (
                            <div className="mt-4">
                              <div className="text-sm text-gray-400 mb-2">Alternative Responses:</div>
                              <div className="space-y-2">
                                {parseResponseChoices(msg).slice(1).map((choice: any, choiceIdx: number) => (
                                  <div key={`choice-${choiceIdx}`} className="bg-gray-700 rounded-lg p-3 text-white opacity-75">
                                    <div className="text-xs text-gray-400 mb-1">Alternative {choiceIdx + 1}</div>
                                    <div className="whitespace-pre-wrap">
                                      {choice.message?.content || choice.content || JSON.stringify(choice)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                }
                
                // Fallback to prompt/response if no structured messages
                return (
                  <div key={idx} className="space-y-2">
                    {msg.prompt && (
                      <div className="bg-gray-700 rounded-lg p-3 text-white">
                        <div className="text-xs text-gray-400 mb-1">User</div>
                        <div className="whitespace-pre-wrap">{msg.prompt}</div>
                      </div>
                    )}
                    
                    {msg.response && (
                      <div className="bg-blue-900 rounded-lg p-3 text-white">
                        <div className="text-xs text-gray-400 mb-1">Assistant</div>
                        <div className="whitespace-pre-wrap">{msg.response}</div>
                      </div>
                    )}
                    
                    {msg.response_status !== 'success' && msg.exception && (
                      <div className="bg-red-900 rounded-lg p-3 text-white">
                        <div className="text-xs text-gray-400 mb-1">Error</div>
                        <div className="whitespace-pre-wrap">{msg.exception}</div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-400">No conversation data available</div>
            )}
          </div>
        )}
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

  return (
    <div className="flex flex-col h-full relative">
      {/* Overlay when detail view is open */}
      {selectedMessage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleCloseDetail}
        />
      )}
      
      <div className="flex-1 overflow-auto min-h-0">
        <div className="min-w-[1024px]">
          <Table>
            <TableHead className="sticky top-0 bg-gray-900 z-10">
              <TableRow>
                <TableHeaderCell>Timestamp</TableHeaderCell>
                <TableHeaderCell>Model</TableHeaderCell>
                <TableHeaderCell>Provider</TableHeaderCell>
                <TableHeaderCell>Organization</TableHeaderCell>
                <TableHeaderCell>Project</TableHeaderCell>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Prompt Tokens</TableHeaderCell>
                <TableHeaderCell>Completion Tokens</TableHeaderCell>
                <TableHeaderCell>Total Tokens</TableHeaderCell>
                <TableHeaderCell>Duration (s)</TableHeaderCell>
                <TableHeaderCell>Cost</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                {searchHighlight && <TableHeaderCell>Relevance</TableHeaderCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data && data.data.length > 0 ? (
                data.data.map((item, idx) => (
                  <TableRow 
                    key={idx}
                    onClick={() => handleRowClick(item)}
                    className="cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    <TableCell>{format(new Date(item.timestamp), 'MMM d, yyyy HH:mm:ss')}</TableCell>
                    <TableCell>{item.model}</TableCell>
                    <TableCell>{item.provider}</TableCell>
                    <TableCell>{item.organization}</TableCell>
                    <TableCell>{item.project}</TableCell>
                    <TableCell>{item.user}</TableCell>
                    <TableCell>{item.prompt_tokens.toLocaleString()}</TableCell>
                    <TableCell>{item.completion_tokens.toLocaleString()}</TableCell>
                    <TableCell>{item.total_tokens.toLocaleString()}</TableCell>
                    <TableCell>{item.duration.toFixed(2)}</TableCell>
                    <TableCell>${item.cost.toFixed(4)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.response_status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.response_status}
                      </span>
                    </TableCell>
                    {searchHighlight && (
                      <TableCell>
                        {item.similarity ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {(item.similarity * 100).toFixed(0)}%
                          </span>
                        ) : '-'}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={searchHighlight ? 13 : 12} className="text-center">
                    No messages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Detail View */}
      {selectedMessage && (
        <DetailView 
          message={selectedMessage} 
          onClose={handleCloseDetail} 
        />
      )}
    </div>
  );
}