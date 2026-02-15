import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scan, AlertCircle, CheckCircle } from 'lucide-react';

interface AuditIssue {
  id: string;
  type: 'critical' | 'serious' | 'moderate';
  description: string;
  count: number;
  aiSuggestions?: string[];
}

const App: React.FC = () => {
  const [audits, setAudits] = useState<AuditIssue[]>([]);
  const [scanning, setScanning] = useState(false);
  const [totalIssues, setTotalIssues] = useState(0);

  const startScan = async () => {
    setScanning(true);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id!, { action: 'scan' });
    setAudits(response.audits || []);
    setTotalIssues(response.totalIssues || 0);
    setScanning(false);
  };

  const critical = audits.filter(a => a.type === 'critical');
  const score = Math.max(0, 100 - totalIssues * 2);

  return (
    <div className="w-96 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-[500px]">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Scan className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          AccessAI
        </h1>
        <p className="text-sm text-gray-500 mt-1">AI-Powered Accessibility</p>
      </div>

      {/* Score */}
      <Card className="mb-6 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Accessibility Score
            {score > 80 ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-orange-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{score.toFixed(0)}%</div>
          <Progress value={score} className="mt-2 h-3" />
          <p className="text-sm text-gray-600 mt-2">{totalIssues} issues found</p>
        </CardContent>
      </Card>

      {/* Scan Button */}
      <Button 
        onClick={startScan} 
        disabled={scanning}
        className="w-full mb-6 font-semibold shadow-lg h-12"
        size="lg"
      >
        {scanning ? (
          <>
            <Scan className="w-4 h-4 mr-2 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Scan className="w-4 h-4 mr-2" />
            Scan Current Page
          </>
        )}
      </Button>

      {/* Issues Grid */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {audits.map((audit) => (
          <Card key={audit.id} className="shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{audit.description}</CardTitle>
                <Badge variant={audit.type as any}>{audit.count}</Badge>
              </div>
              <p className="text-xs text-gray-500">WCAG {audit.id}</p>
            </CardHeader>
            <CardContent>
              {audit.aiSuggestions?.map((suggestion, i) => (
                <div key={i} className="text-xs p-2 bg-green-50 border rounded-md mt-2">
                  💡 AI Fix: "{suggestion}"
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {totalIssues === 0 && (
        <div className="mt-8 text-center text-green-600">
          <CheckCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="font-semibold">Perfect Score!</p>
        </div>
      )}
    </div>
  );
};
export default App;