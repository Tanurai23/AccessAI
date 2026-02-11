import React from 'react';
import { Badge } from './Badge';

export interface AuditIssue {
  id: string;
  type: 'alt' | 'contrast' | 'focus' | 'landmark' | 'heading' | 'form-label' | 'link-text' | 'lang' | 'aria' | 'semantic' | 'keyboard' | 'table';
  severity: 'critical' | 'high' | 'medium' | 'low';
  element: string;
  description: string;
  fixed: boolean;
}

const App: React.FC = () => {
  const [issues, setIssues] = React.useState<AuditIssue[]>([]);
  const [isScanning, setIsScanning] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const scanPage = () => {
    console.log("🚀 Scan button clicked");
    setIsScanning(true);
    setError('');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        console.error("❌ No active tab");
        setError("No active tab found");
        setIsScanning(false);
        return;
      }

      const tabId = tabs[0].id;
      console.log("📤 Sending scan message to tab:", tabId);

      // First, try to inject the content script if it's not already there
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ['content.js']
        },
        () => {
          if (chrome.runtime.lastError) {
            console.log("Content script already injected or error:", chrome.runtime.lastError.message);
          }

          // Now send the scan message
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { action: "scan" }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("❌ Message error:", chrome.runtime.lastError.message);
                setError(`Failed to scan: ${chrome.runtime.lastError.message}`);
                setIsScanning(false);
                return;
              }

              console.log("✅ Full response:", response);
              
              if (response?.error) {
                setError(response.error);
                setIssues([]);
              } else {
                const foundIssues = response?.issues || [];
                console.log("📊 Found issues:", foundIssues.length);
                setIssues(foundIssues);
                
                if (foundIssues.length === 0) {
                  setError("No accessibility issues detected on this page");
                }
              }
              
              setIsScanning(false);
            });
          }, 100);
        }
      );
    });
  };

  // Calculate metrics
  const totalIssues = issues.length;
  const severityCounts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  };

  const wcagRulesCovered = new Set(issues.map(i => i.type)).size;

  return (
    <div style={{ minWidth: '400px', minHeight: '500px' }} className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl">
      <h1 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
        AccessAI Scanner
      </h1>
      
      <button
        onClick={scanPage}
        disabled={isScanning}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all mb-4 disabled:opacity-50 disabled:cursor-not-allowed text-base"
      >
        {isScanning ? '⏳ Scanning...' : '🔍 Scan Current Page'}
      </button>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-200">⚠️ {error}</p>
        </div>
      )}

      {/* METRICS DASHBOARD */}
      {totalIssues > 0 && (
        <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-3 text-purple-300">📊 Audit Metrics</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-slate-900/50 p-3 rounded text-center">
              <div className="text-3xl font-bold text-white">{totalIssues}</div>
              <div className="text-xs text-slate-400">Total Issues</div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded text-center">
              <div className="text-3xl font-bold text-purple-400">{wcagRulesCovered}</div>
              <div className="text-xs text-slate-400">WCAG Rules</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 mb-2">Severity Breakdown:</div>
            
            {severityCounts.critical > 0 && (
              <div className="flex items-center justify-between bg-red-900/20 px-3 py-2 rounded">
                <span className="text-sm text-red-300">🔴 Critical</span>
                <span className="text-base font-bold text-red-400">{severityCounts.critical}</span>
              </div>
            )}
            
            {severityCounts.high > 0 && (
              <div className="flex items-center justify-between bg-orange-900/20 px-3 py-2 rounded">
                <span className="text-sm text-orange-300">🟠 High</span>
                <span className="text-base font-bold text-orange-400">{severityCounts.high}</span>
              </div>
            )}
            
            {severityCounts.medium > 0 && (
              <div className="flex items-center justify-between bg-yellow-900/20 px-3 py-2 rounded">
                <span className="text-sm text-yellow-300">🟡 Medium</span>
                <span className="text-base font-bold text-yellow-400">{severityCounts.medium}</span>
              </div>
            )}
            
            {severityCounts.low > 0 && (
              <div className="flex items-center justify-between bg-green-900/20 px-3 py-2 rounded">
                <span className="text-sm text-green-300">🟢 Low</span>
                <span className="text-base font-bold text-green-400">{severityCounts.low}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ISSUES LIST */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {issues.length === 0 && !error && !isScanning && (
          <p className="text-slate-400 text-sm italic text-center py-6">
            Click scan to detect accessibility issues
          </p>
        )}
        
        {issues.map((issue) => (
          <Badge key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};

export default App;