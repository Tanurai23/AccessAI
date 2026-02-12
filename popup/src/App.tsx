import React, { useState, useEffect } from 'react';
import { Badge } from './Badge';

const App: React.FC = () => {
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');

  const scanPage = async () => {
  console.log("🚀 SCAN STARTED");
  setIsScanning(true);
  setError('');
  setIssues([]);

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab");
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
      throw new Error("Cannot scan chrome:// pages. Try twitter.com or a normal website");
    }

    console.log("📤 Injecting content script into tab:", tab.id, tab.url);

    // Inject content script dynamically
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["popup/dist/content.js"]
    });

    // Wait 50ms to ensure listener is ready
    await new Promise(r => setTimeout(r, 50));

    // Send scan message
    const response = await chrome.tabs.sendMessage(tab.id, { action: "scan" });
    console.log("📥 Response:", response);

    if (response?.error) {
      setError(response.error);
    } else if (response?.issues) {
      setIssues(response.issues);
      if (response.issues.length === 0) setError("✅ Perfect! No accessibility issues found.");
    } else {
      setError("No response from scanner");
    }
  } catch (err: any) {
    console.error("❌ FULL ERROR:", err);
    const msg = err.message || "Connection failed. Refresh page & retry.";
    setError(`Scan failed: ${msg}`);
  } finally {
    setIsScanning(false);
  }
};

  const stats = {
    total: issues.length,
    ai: issues.filter(i => i.aiSuggestion).length,
    critical: issues.filter(i => i.severity === 'critical').length,
  };

  return (
    <div style={{ 
      width: '420px', 
      padding: '20px', 
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
      color: 'white', 
      fontFamily: 'system-ui, sans-serif' 
    }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        background: 'linear-gradient(90deg, #a78bfa 0%, #ec4899 100%)',
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        margin: '0 0 20px 0'
      }}>
        AccessAI Scanner
      </h1>

      <button 
        onClick={scanPage} 
        disabled={isScanning}
        style={{ 
          width: '100%', 
          background: isScanning ? '#6b7280' : 'linear-gradient(90deg, #9333ea 0%, #ec4899 100%)',
          color: 'white', 
          padding: '14px', 
          borderRadius: '12px', 
          border: 'none', 
          fontSize: '16px', 
          fontWeight: '600',
          cursor: isScanning ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {isScanning ? '⏳ Scanning...' : `🔍 Scan Page (${stats.ai > 0 ? `🧠 AI Ready` : ''})`}
      </button>

      {error && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          background: error.includes('✅') ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
          border: `2px solid ${error.includes('✅') ? '#22c55e' : '#ef4444'}`,
          color: error.includes('✅') ? '#22c55e' : '#fca5a5'
        }}>
          {error}
        </div>
      )}

      {issues.length > 0 && (
        <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'rgba(30,58,138,0.3)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#a78bfa' }}>{stats.total}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Issues</div>
          </div>
          <div style={{ background: 'rgba(34,197,94,0.3)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>{stats.ai}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>🧠 AI Fixes</div>
          </div>
        </div>
      )}

      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
        {issues.length === 0 && !isScanning && !error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
            <p>Click Scan to audit WCAG compliance</p>
          </div>
        )}
        {issues.map(issue => <Badge key={issue.id} issue={issue} />)}
      </div>
    </div>
  );
};

export default App;