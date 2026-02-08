import { useState } from "react";

export default function App() {
  const [scanning, setScanning] = useState(false);

  const startScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 1000);
  };

  return (
    <div style={{ width: 300, padding: 16 }}>
      <h2>AccessAI</h2>

      <button onClick={startScan}>
        {scanning ? "Scanning..." : "Scan Page"}
      </button>
    </div>
  );
}
