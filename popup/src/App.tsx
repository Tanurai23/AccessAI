import React from 'react';
import { Badge } from './Badge';

export interface AuditIssue {
  id: string;
  type: 'alt' | 'contrast' | 'focus' | 'landmark' | 'heading' | 'form-label' | 'link-text' | 'lang' | 'aria' | 'semantic' | 'keyboard' | 'table';
  severity: 'critical' | 'high' | 'medium' | 'low';
  element: string;
  description: string;
  fixed: boolean;
  aiSuggestion?: string; // 🔥 AI Alt Text
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
      const tabUrl = tabs[0].url || '';
      
      console.log("📤 Sending scan message to tab:", tabId, tabUrl);

      // Check if URL is scannable
      if (tabUrl.startsWith('chrome://') || tabUrl.startsWith('chrome-extension://') || tabUrl.startsWith('edge://')) {
        setError("Cannot scan browser internal pages. Try https://example.com");
        setIsScanning(false);
        return;
      }

      // Inject content script
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ['content.js']
        },
        () => {
          if (chrome.runtime.lastError) {
            console.log("Script injection:", chrome.runtime.lastError.message);
          }

          // Wait then send message
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { action: "scan" }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("❌ Error:", chrome.runtime.lastError.message);
                setError(`Scan failed: ${chrome.runtime.lastError.message}. Refresh page & try again.`);
                setIsScanning(false);
                return;
              }

              console.log("✅ Response:", response);
              
              if (response?.error) {
                setError(response.error);
                setIssues([]);
              } else {
                const foundIssues = response?.issues || [];
                console.log("📊 Issues:", foundIssues.length);
                console.log("🧠 AI:", foundIssues.filter((i: AuditIssue) => i.aiSuggestion).length);
                
                setIssues(foundIssues);
                
                if (foundIssues.length === 0) {
                  setError("✅ No issues detected!");
                }
              }
              
              setIsScanning(false);
            });
          }, 200);
        }
      );
    });
  };

  // Metrics
  const totalIssues = issues.length;
  const aiSuggestions = issues.filter(i => i.aiSuggestion).length;
  const severityCounts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  };
  const wcagRulesCovered = new Set(issues.map(i => i.type)).size;

  return (
    <div style={{ minWidth: '420px', minHeight: '550px' }} className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          AccessAI
        </h1>
        {aiSuggestions > 0 && (
          <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-1 rounded-full font-semibold">
            🧠 AI
          </span>
        )}
      </div>
      
      <button
        onClick={scanPage}
        disabled={isScanning}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all mb-4 disabled:opacity-50 text-base"
      >
        {isScanning ? '⏳ Scanning...' : '🔍 Scan Page'}
      </button>

      {error && (
        <div className={`mb-4 p-3 rounded-lg border ${error.startsWith('✅') ? 'bg-green-900/30 border-green-500/50' : 'bg-red-900/30 border-red-500/50'}`}>
          <p className={`text-sm ${error.startsWith('✅') ? 'text-green-200' : 'text-red-200'}`}>{error}</p>
        </div>
      )}

      {/* shadcn-style Cards */}
      {totalIssues > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{totalIssues}</div>
              <div className="text-xs text-slate-400">Issues</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-400">{wcagRulesCovered}</div>
              <div className="text-xs text-slate-400">Rules</div>
            </div>
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-700/50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-300">{aiSuggestions}</div>
              <div className="text-xs text-green-400">🧠 AI</div>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
            <div className="text-xs font-semibold text-slate-300 mb-2">Severity:</div>
            <div className="grid grid-cols-2 gap-2">
              {severityCounts.critical > 0 && (
                <div className="flex justify-between bg-red-900/20 px-2 py-1.5 rounded border border-red-800/30">
                  <span className="text-xs text-red-300">🔴 Critical</span>
                  <span className="text-sm font-bold text-red-400">{severityCounts.critical}</span>
                </div>
              )}
              {severityCounts.high > 0 && (
                <div className="flex justify-between bg-orange-900/20 px-2 py-1.5 rounded border border-orange-800/30">
                  <span className="text-xs text-orange-300">🟠 High</span>
                  <span className="text-sm font-bold text-orange-400">{severityCounts.high}</span>
                </div>
              )}
              {severityCounts.medium > 0 && (
                <div className="flex justify-between bg-yellow-900/20 px-2 py-1.5 rounded border border-yellow-800/30">
                  <span className="text-xs text-yellow-300">🟡 Medium</span>
                  <span className="text-sm font-bold text-yellow-400">{severityCounts.medium}</span>
                </div>
              )}
              {severityCounts.low > 0 && (
                <div className="flex justify-between bg-green-900/20 px-2 py-1.5 rounded border border-green-800/30">
                  <span className="text-xs text-green-300">🟢 Low</span>
                  <span className="text-sm font-bold text-green-400">{severityCounts.low}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {issues.length === 0 && !error && !isScanning && (
          <div className="text-center py-8 text-slate-400">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm italic">Click scan</p>
          </div>
        )}
        {issues.map((issue) => (
          <Badge key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};

export default App;