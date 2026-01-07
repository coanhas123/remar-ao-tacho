import { useState } from 'react';

export type SecondaryTab = 'Produtos' | 'Histórias' | 'Moodboards' | 'Diário';

export const useSecondaryTabs = (initial: SecondaryTab = 'Produtos') => {
  const [activeTab, setActiveTab] = useState<SecondaryTab>(initial);

  return {
    activeTab,
    selectTab: setActiveTab,
    tabs: ['Produtos', 'Histórias', 'Moodboards', 'Diário'] as const,
  };
};
