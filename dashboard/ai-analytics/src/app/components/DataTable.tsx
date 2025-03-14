'use client';

// import { useState } from 'react';
import {
  // MultiSelect,
  // MultiSelectItem,
  // Select,
  // SelectItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@tremor/react';

// Mock data
const MOCK_DATA = {
  data: [
    {
      date: '2024-01-01',
      model: 'gpt-4',
      provider: 'OpenAI',
      organization: 'Acme Inc',
      project: 'chatbot',
      environment: 'production',
      user: 'john@acme.com',
      total_tokens: 15000,
      total_requests: 100,
      avg_duration: 250.5
    },
    {
      date: '2024-01-01',
      model: 'gpt-3.5-turbo',
      provider: 'OpenAI',
      organization: 'Beta Corp',
      project: 'support',
      environment: 'staging',
      user: 'jane@beta.com',
      total_tokens: 8000,
      total_requests: 50,
      avg_duration: 150.2
    },
    {
      date: '2024-01-01',
      model: 'gpt-4',
      provider: 'OpenAI',
      organization: 'Acme Inc',
      project: 'chatbot',
      environment: 'production',
      user: 'john@acme.com',
      total_tokens: 15000,
      total_requests: 100,
      avg_duration: 250.5
    },
    {
      date: '2024-01-01',
      model: 'gpt-3.5-turbo',
      provider: 'OpenAI',
      organization: 'Beta Corp',
      project: 'support',
      environment: 'staging',
      user: 'jane@beta.com',
      total_tokens: 8000,
      total_requests: 50,
      avg_duration: 150.2
    },
    {
      date: '2024-01-01',
      model: 'gpt-4',
      provider: 'OpenAI',
      organization: 'Acme Inc',
      project: 'chatbot',
      environment: 'production',
      user: 'john@acme.com',
      total_tokens: 15000,
      total_requests: 100,
      avg_duration: 250.5
    },
    {
      date: '2024-01-01',
      model: 'gpt-3.5-turbo',
      provider: 'OpenAI',
      organization: 'Beta Corp',
      project: 'support',
      environment: 'staging',
      user: 'jane@beta.com',
      total_tokens: 8000,
      total_requests: 50,
      avg_duration: 150.2
    },
    {
      date: '2024-01-01',
      model: 'gpt-4',
      provider: 'OpenAI',
      organization: 'Acme Inc',
      project: 'chatbot',
      environment: 'production',
      user: 'john@acme.com',
      total_tokens: 15000,
      total_requests: 100,
      avg_duration: 250.5
    },
    {
      date: '2024-01-01',
      model: 'gpt-3.5-turbo',
      provider: 'OpenAI',
      organization: 'Beta Corp',
      project: 'support',
      environment: 'staging',
      user: 'jane@beta.com',
      total_tokens: 8000,
      total_requests: 50,
      avg_duration: 150.2
    },
    {
      date: '2024-01-01',
      model: 'gpt-4',
      provider: 'OpenAI',
      organization: 'Acme Inc',
      project: 'chatbot',
      environment: 'production',
      user: 'john@acme.com',
      total_tokens: 15000,
      total_requests: 100,
      avg_duration: 250.5
    },
    {
      date: '2024-01-01',
      model: 'gpt-3.5-turbo',
      provider: 'OpenAI',
      organization: 'Beta Corp',
      project: 'support',
      environment: 'staging',
      user: 'jane@beta.com',
      total_tokens: 8000,
      total_requests: 50,
      avg_duration: 150.2
    },
    {
      date: '2024-01-01',
      model: 'gpt-4',
      provider: 'OpenAI',
      organization: 'Acme Inc',
      project: 'chatbot',
      environment: 'production',
      user: 'john@acme.com',
      total_tokens: 15000,
      total_requests: 100,
      avg_duration: 250.5
    },
    {
      date: '2024-01-01',
      model: 'gpt-3.5-turbo',
      provider: 'OpenAI',
      organization: 'Beta Corp',
      project: 'support',
      environment: 'staging',
      user: 'jane@beta.com',
      total_tokens: 8000,
      total_requests: 50,
      avg_duration: 150.2
    },
    // Add more mock entries as needed
  ]
};

interface DataTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any; // We'll ignore the passed data for now and use mock data
}

export default function DataTable({ data = MOCK_DATA }: DataTableProps) {
  // const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  // const [selectedOwners, setSelectedOwners] = useState<string[]>([]);

  // const isStatusSelected = (item: any) =>
  //   (selectedStatus.includes(item.model) || selectedStatus.length === 0) &&
  //   (selectedOwners.includes(item.organization) || selectedOwners.length === 0);

  // const filteredData = data.data.filter((item) => isStatusSelected(item));

  // Get unique values for filters
  // const models = Array.from(new Set(MOCK_DATA.data.map(item => item.model)));
  // const organizations = Array.from(new Set(MOCK_DATA.data.map(item => item.organization)));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none">
        <div className="md:flex md:items-center md:justify-between md:space-x-8">
          {/* <div>
            <h3 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Recent Activity
            </h3>
            <p className="mt-1 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
              Overview of recent LLM usage across your organization.
            </p>
          </div> */}
          {/* <div className="mt-4 sm:flex sm:items-center sm:space-x-2 md:mt-0">
            <MultiSelect
              onValueChange={setSelectedStatus}
              placeholder="Select model..."
              className="w-full sm:w-44 [&>button]:rounded-tremor-small"
            >
              {models.map(model => (
                <MultiSelectItem key={model} value={model}>
                  {model}
                </MultiSelectItem>
              ))}
            </MultiSelect>
            <Select
              onValueChange={(value) => setSelectedOwners([value])}
              placeholder="Select organization..."
              className="mt-2 w-full sm:mt-0 sm:w-44 [&>button]:rounded-tremor-small"
            >
              {organizations.map(org => (
                <SelectItem key={org} value={org}>
                  {org}
                </SelectItem>
              ))}
            </Select>
          </div> */}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto min-h-0">
        <div className="min-w-[1024px]">
          <Table>
            <TableHead className="sticky top-0 bg-gray-900 z-10">
              <TableRow>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Model</TableHeaderCell>
                <TableHeaderCell>Organization</TableHeaderCell>
                <TableHeaderCell>Project</TableHeaderCell>
                <TableHeaderCell>Environment</TableHeaderCell>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Tokens</TableHeaderCell>
                <TableHeaderCell>Requests</TableHeaderCell>
                <TableHeaderCell>Avg Duration</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.data.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.model}</TableCell>
                    <TableCell>{item.organization}</TableCell>
                    <TableCell>{item.project}</TableCell>
                    <TableCell>{item.environment}</TableCell>
                    <TableCell>{item.user}</TableCell>
                    <TableCell>{item.total_tokens.toLocaleString()}</TableCell>
                    <TableCell>{item.total_requests.toLocaleString()}</TableCell>
                    <TableCell>{item.avg_duration.toFixed(2)}ms</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No results.
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