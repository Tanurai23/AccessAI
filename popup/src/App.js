import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const App = () => {
    const [results, setResults] = useState([]);
    const [scanning, setScanning] = useState(false);
    const startScan = async () => {
        try {
            setScanning(true);
            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            if (!tab?.id)
                throw new Error("No active tab");
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: "scan",
            });
            setResults(response?.audits || []);
        }
        catch (err) {
            console.error("Scan failed:", err);
            setResults([{ id: "error", issues: ["Scan failed"] }]);
        }
        finally {
            setScanning(false);
        }
    };
    return (_jsxs("div", { className: "w-80 p-4 bg-white shadow-lg rounded-lg", children: [_jsx("h1", { className: "text-xl font-bold text-gray-800 mb-4", children: "AccessAI" }), _jsx("button", { onClick: startScan, disabled: scanning, className: "w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50", children: scanning ? 'Scanning...' : '🔍 Scan Current Page' }), _jsx("div", { className: "mt-4 max-h-64 overflow-y-auto", children: results.map((result) => (_jsx("div", { className: "p-2 bg-red-50 border border-red-200 rounded mt-2", children: _jsx("p", { className: "font-medium", children: result.issues[0] }) }, result.id))) })] }));
};
export default App;
