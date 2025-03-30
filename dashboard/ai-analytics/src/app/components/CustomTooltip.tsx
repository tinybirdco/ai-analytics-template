interface TooltipEntry {
  name: string;
  value: number | string;
  color: string;
}

interface CustomTooltipProps {
  date?: string;
  entries: TooltipEntry[];
}

export default function CustomTooltip({ date, entries }: CustomTooltipProps) {
  return (
    <div className="bg-[#353535] p-3 shadow-lg px-4">
      {date && (
        <div className="default-font mb-1">
          {date}
        </div>
      )}
      {entries.map((entry, index) => (
        <div key={index} className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[#C6C6C6] font-['Roboto'] text-sm truncate max-w-[180px]">{entry.name}</span>
          </div>
          <span className="text-[#F4F4F4] font-['Roboto'] text-sm ml-2">
            ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
} 