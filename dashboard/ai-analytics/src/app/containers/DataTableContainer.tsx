import { Card } from '@tremor/react';
import DataTable from '../components/DataTable';
import { useLLMUsage } from '@/hooks/useTinybirdData';

interface DataTableContainerProps {
  data: any;
  isLoading: boolean;
}

export default function DataTableContainer({ data, isLoading }: DataTableContainerProps) {
  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="h-full rounded-none flex flex-col overflow-hidden" style={{ boxShadow: 'none' }}>
      <div className="flex-1 overflow-auto">
        <DataTable data={data} />
      </div>
    </Card>
  );
} 