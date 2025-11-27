import React from 'react';

interface HelpTabsProps {
  activeTab: 'faq' | 'contact' | 'resources';
  onTabChange: (tab: 'faq' | 'contact' | 'resources') => void;
}

const HelpTabs: React.FC<HelpTabsProps> = ({ activeTab, onTabChange }) => {
  const faqCategories = [
    { title: 'Getting Started', questions: 3 },
    { title: 'Reporting Issues', questions: 3 },
    { title: 'Volunteering', questions: 3 }
  ];

  const totalFaqs = faqCategories.reduce((acc, cat) => acc + cat.questions, 0);

  const tabs = [
    { id: 'faq', name: 'FAQ', count: totalFaqs },
    { id: 'contact', name: 'Contact Us', count: null },
    { id: 'resources', name: 'Resources', count: 3 }
  ];

  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.name}
            {tab.count && (
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default HelpTabs;