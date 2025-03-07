'use client';

import { useState } from 'react';

const organizations = {
  'acme_corp': {
    projects: ['marketplace', 'logistics', 'payments'],
  },
  'tech_dynamics': {
    projects: ['mobile_app', 'web_platform', 'analytics'],
  },
  'quantum_systems': {
    projects: ['quantum_sim', 'research_lab', 'cloud_compute'],
  },
  'data_pioneers': {
    projects: ['data_lake', 'ml_platform', 'bi_tools'],
  },
  'future_retail': {
    projects: ['pos_system', 'inventory', 'customer_portal'],
  }
};

export default function TopBar() {
  return (
    <div className="h-12 border-b border-gray-700">
      <h1 className="text-xl font-bold h-full flex items-center px-4">AI Analytics Dashboard</h1>
    </div>
  );
} 