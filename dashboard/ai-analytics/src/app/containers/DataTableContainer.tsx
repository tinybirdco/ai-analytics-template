'use client';

import DataTable from '../components/DataTable';
import { useLLMMessages } from '@/hooks/useTinybirdData';

interface DataTableContainerProps {
  filters: Record<string, string>;
  isLoading?: boolean;
}

export default function DataTableContainer({ filters, isLoading: parentLoading }: DataTableContainerProps) {
  // Use the LLM messages hook
  const { data: messagesData, isLoading: messagesLoading } = useLLMMessages(filters);
  
  // Combine loading states
  const isLoading = parentLoading || messagesLoading;

  return (
    <div className="h-full p-4">
      <DataTable 
        data={messagesData} 
        isLoading={isLoading} 
      />
    </div>
  );
} 