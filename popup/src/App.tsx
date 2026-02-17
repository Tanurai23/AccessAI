import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scan, AlertCircle, CheckCircle, Wand2 } from 'lucide-react';
import { toast } from 'sonner'; // Add if not installed: npm i sonner

interface AuditIssue {
  id: string;
  type: 'alt' | 'contrast' | 'focus' | 'landmark' | 'heading' | 'form-label' | 'link-text' | 'lang' | 'aria' | 'semantic' | 'keyboard' | 'table';
  severity: 'critical' | 'high' | 'medium' | 'low';
  element: string;
  description: string;
  fixed: boolean;
  aiSuggestion?: string;
}

const App: React.FC = () => {
  const [audits, setAudits] = useState<AuditIssue[]>([]);
  const [scanning, setScanning] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [totalIssues, setTotalIssues] = useState(0);

  // 🔥 SCAN FUNCTION (updated for new content.ts format)
  const startScan = async () => {
    setScanning(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id!, { action: 'scan' });
      
      setAudits(response.issues || []);
      setTotalIssues(response.total || 0);
      
      toast.success('Scan complete!', {
        description: `${response.total || 0} issues found`
      });
    } catch (error) {
      toast.error('Scan failed');
    } finally {
      setScanning(false);
    }
  };

  // 🔥 NEW: APPLY FIXES FUNCTION
  const applyFixes = async () => {
    if (audits.length === 0 || fixing) return;
    
    setFixing(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Build fixes from current audits
      const fixes = audits
        .filter(audit => !audit.fixed)
        .map(audit => ({
          type: audit.type,
          elements: [],
          aiText: audit.aiSuggestion ? [audit.aiSuggestion] : undefined
        }));

      await chrome.tabs.sendMessage(tab.id!, { 
        action: 'apply-fixes', 
        fixes 
      });
      
      toast.success('🛠️ Fixes applied!', {
        description: `Applied ${fixes.length} fixes. Re-scan to verify!`
      });
      
      // Auto re-scan after 2s
      setTimeout(startScan, 2000);
      
    } catch (error) {
      toast.error('Fix failed: ' + (error as Error).message);
    } finally {
      setFixing(false);
    }
  };

  const fixedCount = audits.filter(a => a.fixed).length;
  const score = Math.max(0, 100 - (totalIssues - fixedCount) * 3);
  const fixableCount = audits.filter(a => !a.fixed && a.aiSuggestion).length;

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

      {/* Score Card */}
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
          <p className="text-sm text-gray-600 mt-2">
            {totalIssues} total, {fixedCount} fixed
          </p>
        </CardContent>
      </Card>

      {/* 🔥 SCAN BUTTON */}
      <Button 
        onClick={startScan} 
        disabled={scanning || fixing}
        className="w-full mb-3 font-semibold shadow-lg h-12"
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
            🔍 Scan Page
          </>
        )}
      </Button>

      {/* 🔥 NEW: FIX BUTTON */}
      <Button 
        onClick={applyFixes}
        disabled={scanning || fixing || fixableCount === 0}
        className="w-full mb-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-semibold shadow-lg h-12"
        size="lg"
      >
        {fixing ? (
          <>
            <Wand2 className="w-4 h-4 mr-2 animate-spin" />
            Fixing...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            ✨ Apply {fixableCount} AI Fixes
          </>
        )}
      </Button>

      {/* Issues Grid */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {audits.map((audit) => (
          <Card key={audit.id} className={`shadow-sm hover:shadow-md transition-all ${audit.fixed ? 'border-green-200 bg-green-50/50' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {audit.fixed ? '✅ ' : ''}{audit.description}
                </CardTitle>
                <Badge variant={audit.fixed ? "default" : audit.severity as any} className={audit.fixed ? "bg-green-500" : ""}>
                  {audit.fixed ? "FIXED" : audit.severity.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">{audit.element}</p>
            </CardHeader>
            <CardContent>
              {audit.aiSuggestion && (
                <div className="text-xs p-2 bg-blue-50 border border-blue-200 rounded-md mt-2">
                  💡 AI: "{audit.aiSuggestion}"
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {totalIssues === 0 && (
        <div className="mt-8 text-center text-green-600">
          <CheckCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="font-semibold">Perfect Score! 🎉</p>
        </div>
      )}
    </div>
  );
};

export default App;