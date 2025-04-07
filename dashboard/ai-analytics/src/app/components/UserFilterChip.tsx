'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApiKeyStore } from '@/stores/apiKeyStore';

interface UserFilterChipProps {
  userHash: string;
}

export default function UserFilterChip({ userHash }: UserFilterChipProps) {
  const [isActive, setIsActive] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openaiKey } = useApiKeyStore();

  // Check if user filter is active based on URL parameters
  useEffect(() => {
    const userFilter = searchParams.get('user');
    setIsActive(userFilter === userHash);
  }, [searchParams, userHash]);

  const handleToggle = () => {
    if (!openaiKey) return;
    
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
      className={`inline-flex items-center gap-2 px-[10px] py-1.5 rounded-full font-['Roboto'] text-xs cursor-pointer transition-colors group ${
        isActive 
          ? 'bg-[var(--accent)] text-[rgb(10,10,10)]' 
          : 'bg-[#393939] text-[#C6C6C6] hover:text-[var(--accent)] border border-transparent hover:bg-transparent hover:border hover:border-[var(--accent)]'
      }`}
      onClick={handleToggle}
    >
      <div className={`flex items-center justify-center w-3 h-3 rounded-full border ${
        isActive 
          ? 'border-[rgb(10,10,10)] bg-[rgb(10,10,10)]' 
          : 'border-[#C6C6C6] group-hover:border-[var(--accent)]'
      }`}>
        {isActive && <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />}
      </div>
      <span>{isActive ? 'All LLM calls' : 'Your LLM calls'}</span>
    </div>
  );
} 