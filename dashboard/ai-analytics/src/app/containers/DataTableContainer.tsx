import { Card } from '@tremor/react';
import DataTable from '../components/DataTable';
import { useLLMUsage } from '@/hooks/useTinybirdData';

interface DataTableContainerProps {
  filters: Record<string, string>;
}

export default function DataTableContainer({ filters }: DataTableContainerProps) {
  const { data, isLoading, error } = useLLMUsage(filters);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <Card className="h-full rounded-none flex flex-col overflow-hidden" style={{ boxShadow: 'none' }}>
      <div className="flex-1 overflow-auto">
        <DataTable data={data} />
      </div>
    </Card>
  );
} 