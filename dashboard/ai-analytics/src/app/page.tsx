import TopBar from './components/TopBar';
import TimeseriesChart from './components/TimeseriesChart';
import MetricsCards from './components/MetricsCards';
import DataTable from './components/DataTable';
import TabbedPane from './components/TabbedPane';

export default function Dashboard() {
  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <TopBar />
      
      <main className="flex-1 grid grid-rows-[60%_40%]">
        {/* Upper Section - 60% height */}
        <div className="grid grid-cols-[1fr_minmax(0,max(33.333%,400px))]">
          {/* Timeseries Chart */}
          <div className="border border-gray-700">
            <TimeseriesChart />
          </div>
          
          {/* Metrics Cards */}
          <div className="border border-gray-700">
            <MetricsCards />
          </div>
        </div>
        
        {/* Lower Section - 40% height */}
        <div className="grid grid-cols-[1fr_minmax(0,max(33.333%,400px))]">
          {/* Data Table with Search */}
          <div className="border border-gray-700">
            <DataTable />
          </div>
          
          {/* Tabbed Pane */}
          <div className="border border-gray-700">
            <TabbedPane />
          </div>
        </div>
      </main>
    </div>
  );
}