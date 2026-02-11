import React from 'react';
import { AuditIssue } from './App';

interface BadgeProps {
  issue: AuditIssue;
}

export const Badge: React.FC<BadgeProps> = ({ issue }) => {
  const severityColors = {
    critical: 'bg-red-500 border-red-400',
    high: 'bg-orange-500 border-orange-400',
    medium: 'bg-yellow-500 border-yellow-400',
    low: 'bg-green-500 border-green-400'
  };

  const typeIcons: Record<string, string> = {
    alt: '🖼️',
    contrast: '🌓',
    focus: '🎯',
    landmark: '🗺️',
    heading: '📋',
    'form-label': '📝',
    'link-text': '🔗',
    lang: '🌐',
    aria: '♿',
    semantic: '🏗️',
    keyboard: '⌨️',
    table: '📊'
  };

  return (
    <div className={`p-3 rounded-lg border-2 ${severityColors[issue.severity || 'low']} bg-opacity-20 backdrop-blur-sm shadow-md hover:shadow-lg transition-all`}>
      <div className="flex items-start gap-3">
        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${severityColors[issue.severity || 'low']}`}>
          <div className="w-2 h-2 bg-white rounded-full mt-0.5 ml-0.5 animate-pulse"></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm capitalize flex items-center gap-2">
            <span>{typeIcons[issue.type] || '⚠️'}</span>
            <span>{issue.type.replace('-', ' ')}</span>
          </div>
          <div className="text-xs opacity-80 mt-1">{issue.description}</div>
          {issue.element !== 'document' && (
            <div className="text-xs opacity-60 mt-1 font-mono truncate">{issue.element}</div>
          )}
          
          {/* 🔥 AI SUGGESTION */}
          {issue.aiSuggestion && (
            <div className="mt-2 p-2 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-700/50 rounded text-xs">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-green-300">🧠 AI Suggestion:</span>
              </div>
              <div className="text-green-100 italic">"{issue.aiSuggestion}"</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};