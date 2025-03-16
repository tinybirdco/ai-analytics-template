'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@tremor/react';
import { format } from 'date-fns';

// Define the shape of the LLM message data
interface LLMMessage {
  timestamp: string;
  organization: string;
  project: string;
  environment: string;
  user: string;
  chat_id: string;
  model: string;
  provider: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  duration: number;
  cost: number;
  response_status: string;
  exception: string | null;
}

interface DataTableProps {
  data?: { data: LLMMessage[] };
  isLoading?: boolean;
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

export default function DataTable({ data = MOCK_DATA, isLoading = false }: DataTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none">
        <div className="md:flex md:items-center md:justify-between md:space-x-8">
          {/* <div>
            <h3 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Recent Messages
            </h3>
            <p className="mt-1 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
              Detailed view of recent LLM interactions
            </p>
          </div> */}
        </div>
      </div>
      
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
                <TableHeaderCell>Duration (ms)</TableHeaderCell>
                <TableHeaderCell>Cost ($)</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data && data.data.length > 0 ? (
                data.data.map((item, idx) => (
                  <TableRow key={idx}>
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} className="text-center">
                    No messages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}