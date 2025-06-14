import React from 'react';

interface StrategyDisplayProps {
  content: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function StrategyDisplay({ content, timestamp, status }: StrategyDisplayProps) {
  // Parse the strategy content into sections
  const parseStrategy = (text: string) => {
    const sections: { title: string; content: string }[] = [];
    const lines = text.split('\n');
    let currentSection = { title: '', content: '' };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if line is a section header (starts with ##, #, or is in ALL CAPS)
      if (
        trimmedLine.startsWith('##') || 
        trimmedLine.startsWith('#') ||
        (trimmedLine.length > 0 && trimmedLine === trimmedLine.toUpperCase() && trimmedLine.includes(' '))
      ) {
        // Save previous section if it has content
        if (currentSection.title && currentSection.content) {
          sections.push({ ...currentSection });
        }
        
        // Start new section
        currentSection = {
          title: trimmedLine.replace(/^#+\s*/, '').replace(/:/g, ''),
          content: ''
        };
      } else if (trimmedLine.length > 0) {
        // Add content to current section
        currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
      }
    }
    
    // Add the last section
    if (currentSection.title && currentSection.content) {
      sections.push(currentSection);
    }
    
    // If no sections found, treat entire content as one section
    if (sections.length === 0) {
      sections.push({ title: 'Marketing Strategy', content: text });
    }
    
    return sections;
  };

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        const trimmedLine = line.trim();
        
        // Handle bullet points
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          return (
            <li key={index} className="ml-4 mb-1">
              {trimmedLine.substring(1).trim()}
            </li>
          );
        }
        
        // Handle numbered lists
        if (/^\d+\./.test(trimmedLine)) {
          return (
            <li key={index} className="ml-4 mb-1 list-decimal">
              {trimmedLine.replace(/^\d+\.\s*/, '')}
            </li>
          );
        }
        
        // Handle bold text (wrapped in **)
        if (trimmedLine.includes('**')) {
          const parts = trimmedLine.split('**');
          return (
            <p key={index} className="mb-2">
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </p>
          );
        }
        
        // Regular paragraph
        if (trimmedLine.length > 0) {
          return <p key={index} className="mb-2">{trimmedLine}</p>;
        }
        
        return null;
      })
      .filter(Boolean);
  };

  const sections = parseStrategy(content);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              🤖 AI Marketing Strategy
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Generated on {new Date(timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Strategy Content */}
      <div className="p-6">
        <div className="grid gap-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  {index + 1}
                </span>
                {section.title}
              </h4>
              <div className="text-gray-700 text-sm leading-relaxed">
                <ul className="space-y-1">
                  {formatContent(section.content)}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            📋 Copy Strategy
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            🚀 Launch Campaign
          </button>
        </div>
      </div>
    </div>
  );
} 