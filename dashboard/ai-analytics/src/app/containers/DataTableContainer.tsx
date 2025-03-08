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
    <Card className="h-full rounded-none flex flex-col" style={{ boxShadow: 'none' }}>
      <h2 className="text-lg font-semibold flex-none">Recent Activity</h2>
      <div className="flex-1 overflow-auto min-h-0">
        <DataTable data={data} />
      </div>
    </Card>
  );
} 