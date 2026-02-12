import React from 'react';
import { AuditIssue } from "./types";

interface BadgeProps {
  issue: AuditIssue;
}

export const Badge: React.FC<BadgeProps> = ({ issue }) => {
  const severityStyles = {
    critical: { bg: 'rgba(127, 29, 29, 0.2)', border: '#dc2626', color: '#fca5a5' },
    high: { bg: 'rgba(124, 45, 18, 0.2)', border: '#ea580c', color: '#fdba74' },
    medium: { bg: 'rgba(113, 63, 18, 0.2)', border: '#ca8a04', color: '#fde047' },
    low: { bg: 'rgba(20, 83, 45, 0.2)', border: '#16a34a', color: '#86efac' }
  };

  const typeIcons: Record<string, string> = {
    alt: '🖼️', contrast: '🌓', focus: '🎯', landmark: '🗺️',
    heading: '📋', 'form-label': '📝', 'link-text': '🔗', lang: '🌐',
    aria: '♿', semantic: '🏗️', keyboard: '⌨️', table: '📊'
  };

  const style = severityStyles[issue.severity] || severityStyles.low;

  return (
    <div style={{
      padding: '12px',
      borderRadius: '8px',
      border: `2px solid ${style.border}`,
      background: style.bg,
      marginBottom: '8px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: style.border,
          marginTop: '4px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'white',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: '600',
            fontSize: '13px',
            textTransform: 'capitalize',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: style.color
          }}>
            <span>{typeIcons[issue.type] || '⚠️'}</span>
            <span>{issue.type.replace('-', ' ')}</span>
          </div>
          
          <div style={{
            fontSize: '12px',
            opacity: 0.8,
            marginTop: '4px',
            color: '#e2e8f0'
          }}>
            {issue.description}
          </div>
          
          {issue.element !== 'document' && (
            <div style={{
              fontSize: '11px',
              opacity: 0.6,
              marginTop: '4px',
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '#cbd5e1'
            }}>
              {issue.element}
            </div>
          )}
          
          {issue.aiSuggestion && (
            <div style={{
              marginTop: '8px',
              padding: '8px',
              background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(5, 150, 105, 0.4) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '4px'
              }}>
                <span style={{ color: '#6ee7b7' }}>🧠 AI Suggestion:</span>
              </div>
              <div style={{
                color: '#d1fae5',
                fontStyle: 'italic'
              }}>
                "{issue.aiSuggestion}"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};