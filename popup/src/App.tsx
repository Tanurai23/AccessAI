import React, { useState } from 'react';

interface AuditResult {
  id: string;
  issues: string[];
}

const App: React.FC = () => {

  const [results, setResults] = useState<AuditResult[]>([]);
  const [scanning, setScanning] = useState(false);

const startScan = async () => {
  try {
    setScanning(true);

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) throw new Error("No active tab");

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "scan",
    });

    setResults(response?.audits || []);
  } catch (err) {
    console.error("Scan failed:", err);
    setResults([{ id: "error", issues: ["Scan failed"] }]);
  } finally {
    setScanning(false);
  }
};

return (
    <div className="w-80 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-xl font-bold text-gray-800 mb-4">AccessAI</h1>
      
      <button
        onClick={startScan}
        disabled={scanning}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {scanning ? 'Scanning...' : '🔍 Scan Current Page'}
      </button>

      <div className="mt-4 max-h-64 overflow-y-auto">
        {results.map((result) => (
          <div key={result.id} className="p-2 bg-red-50 border border-red-200 rounded mt-2">
            <p className="font-medium">{result.issues[0]}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
