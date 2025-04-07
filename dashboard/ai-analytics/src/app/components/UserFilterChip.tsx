'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

interface UserFilterChipProps {
  userHash: string;
}

export default function UserFilterChip({ userHash }: UserFilterChipProps) {
  const [isActive, setIsActive] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check if user filter is active based on URL parameters
  useEffect(() => {
    const userFilter = searchParams.get('user');
    setIsActive(userFilter === userHash);
  }, [searchParams, userHash]);

  const handleToggle = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (isActive) {
      // Remove user filter
      newParams.delete('user');
    } else {
      // Clear all other filters and set user filter
      newParams.forEach((_, key) => newParams.delete(key));
      newParams.set('user', userHash);
    }
    
    router.push(`?${newParams.toString()}`);
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 px-[10px] py-1.5 rounded-full font-['Roboto'] text-xs cursor-pointer transition-colors ${
        isActive 
          ? 'bg-[var(--accent)] text-[rgb(10,10,10)]' 
          : 'bg-[#393939] text-[#C6C6C6] hover:text-[var(--accent)] border border-transparent hover:bg-transparent hover:border hover:border-[var(--accent)]'
      }`}
      onClick={handleToggle}
    >
      <span>See your LLM calls</span>
      {isActive && <Check className="h-4 w-4" />}
    </div>
  );
} 