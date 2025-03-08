export const tabs = [
  { name: 'Model', key: 'model' },
  { name: 'Provider', key: 'provider' },
  { name: 'Organization', key: 'organization' },
  { name: 'Project', key: 'project' },
  { name: 'Environment', key: 'environment' },
  { name: 'User', key: 'user' }
] as const;

export type TabKey = typeof tabs[number]['key']; 