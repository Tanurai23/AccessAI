import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';  // ✅ FIXED: card.tsx
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scan, AlertCircle, CheckCircle, Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProStatus } from '@/hooks/useProStatus';  // ✅ ADDED
import { trackUsage } from '@/pro';  // ✅ ADDED
import { UpgradeCard } from '@/components/ui/UpgradeCard';  // ✅ ADDED

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
  const [aiLoading, setAiLoading] = useState(false);
  const [totalIssues, setTotalIssues] = useState(0);
  const [savedScansCount, setSavedScansCount] = useState(0);  // ✅ NEW: Pro tracking
  
  // ✅ PRO STATUS HOOK
  const { isPro, loading: proLoading } = useProStatus();

  // ✅ LOAD SAVED SCANS COUNT
  useEffect(() => {
    chrome.storage.sync.get('savedScans', (result) => {
      setSavedScansCount(Array.isArray(result.savedScans) ? result.savedScans.length : 0);
    });
  }, []);

  const startScan = async () => {
    // ✅ PRO: Track scan usage
    if (!isPro) {
      const allowed = await trackUsage('scan');
      if (!allowed) {
        toast.error('💎 Pro required for more scans (5/day free)');
        return;
      }
    }

    setScanning(true);
    setAiLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id!, { action: 'scan' });
      
      if (response.error) throw new Error(response.error);
      
      setAudits(response.issues || []);
      setTotalIssues(response.total || 0);
      
      toast.success('🤖 AI Scan Complete!', {
        description: `${response.total || 0} issues found`
      });
    } catch (error) {
      toast.error('Scan failed: ' + (error as Error).message);
    } finally {
      setScanning(false);
      setAiLoading(false);
    }
  };

  const saveCurrentScan = async () => {
    // ✅ PRO: Check limits + track usage
    if (!isPro) {
      const allowed = await trackUsage('save');
      if (!allowed || savedScansCount >= 3) {
        toast.error('💎 Pro required for saved scans (3 free max)');
        return;
      }
    }

    if (audits.length === 0) {
      toast.info('Run a scan first');
      return;
    }

    const scanData = {
      id: crypto.randomUUID(),
      url: window.location.href,
      score: Math.max(0, 100 - (totalIssues - audits.filter(a => a.fixed).length) * 4),
      date: new Date().toISOString(),
      issues: audits
    };

    const saved = await chrome.storage.sync.get('savedScans');
    const scans = Array.isArray(saved.savedScans) ? [...saved.savedScans, scanData] : [scanData];
    
    await chrome.storage.sync.set({ savedScans: scans });
    setSavedScansCount(scans.length);
    
    toast.success('💾 Scan Saved!', {
      description: `${savedScansCount + 1} total`
    });
  };

  const applyFixes = async () => {
    if (audits.length === 0 || fixing) return;
    
    setFixing(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const aiFixable = audits.filter(a => !a.fixed && a.aiSuggestion).length;
      if (aiFixable === 0) {
        toast.info('No AI fixes available');
        return;
      }
      
      const fixes = audits
        .filter(audit => !audit.fixed && audit.aiSuggestion)
        .map(audit => ({
          type: audit.type as any,
          elements: [],
          aiText: [audit.aiSuggestion!]
        }));

      await chrome.tabs.sendMessage(tab.id!, { 
        action: 'apply-fixes', 
        fixes 
      });
      
      toast.success('✨ AI Fixes Applied!', {
        description: `Fixed ${fixes.length} issues live`
      });
      
    } catch (error) {
      toast.error('Fix failed');
    } finally {
      setFixing(false);
    }
  };

  const fixedCount = audits.filter(a => a.fixed).length;
  const score = Math.max(0, 100 - (totalIssues - fixedCount) * 4);
  const aiFixable = audits.filter(a => !a.fixed && a.aiSuggestion).length;

  if (proLoading) {
    return <div className="w-96 p-6 flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-2" />
      <span>Loading Pro status...</span>
    </div>;
  }

  return (
    <div className="w-96 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-[500px]">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Scan className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          AccessAI v2.1
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isPro ? '💎 Pro' : 'Free'} • {savedScansCount} saved
        </p>
      </div>

      <Card className="mb-6 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Accessibility Score
            {score > 85 ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-orange-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{score.toFixed(0)}%</div>
          <Progress value={score} className="mt-2 h-3" />
          <p className="text-sm text-gray-600 mt-2">
            {totalIssues} total • {aiFixable} AI-fixable • {fixedCount} fixed
          </p>
        </CardContent>
      </Card>

      {/* ✅ PRO: SAVE SCAN BUTTON */}
      <Button 
        onClick={saveCurrentScan}
        disabled={audits.length === 0 || proLoading}
        variant={isPro ? "default" : "outline"}
        className="w-full mb-3 font-semibold shadow-md h-11 text-xs"
        size="sm"
      >
        💾 Save Scan {isPro && `(${savedScansCount})`}
      </Button>

      {/* SCAN BUTTON */}
      <Button 
        onClick={startScan} 
        disabled={scanning || fixing}
        className="w-full mb-3 font-semibold shadow-lg h-12"
        size="lg"
      >
        {scanning ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {aiLoading ? '🤖 AI Analyzing...' : 'Scanning...'}
          </>
        ) : (
          <>
            <Scan className="w-4 h-4 mr-2" />
            🔍 AI-Powered Scan
          </>
        )}
      </Button>

      {/* FIX BUTTON */}
      <Button 
        onClick={applyFixes}
        disabled={scanning || fixing || aiFixable === 0} 
        className="w-full mb-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 font-semibold shadow-lg h-12"
        size="lg"
      >
        {fixing ? (
          <>
            <Wand2 className="w-4 h-4 mr-2 animate-spin" />
            Applying AI Fixes...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            ✨ Apply {aiFixable} AI Fixes
          </>
        )}
      </Button>

      {/* ✅ PRO: UPGRADE CARD (shows when limits hit) */}
      {!isPro && audits.length > 0 && (
        <UpgradeCard feature="saved scans & unlimited scans" className="mb-4" />
      )}

      {/* Issues List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {audits.map((audit) => (
          <Card key={audit.id} className={`shadow-sm hover:shadow-md transition-all ${audit.fixed ? 'border-green-200 bg-green-50/50' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {audit.fixed ? '✅ ' : '🔍 '}{audit.description}
                </CardTitle>
                <Badge variant={audit.fixed ? "default" : "secondary"} className={audit.fixed ? "bg-green-500" : ""}>
                  {audit.fixed ? "FIXED" : audit.severity.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">{audit.element}</p>
            </CardHeader>
            <CardContent>
              {audit.aiSuggestion && (
                <div className="text-xs p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md mt-2 font-medium">
                  🤖 AI: "{audit.aiSuggestion}"
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {totalIssues === 0 && !scanning && (
        <div className="mt-8 text-center text-green-600">
          <CheckCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="font-semibold">Perfect Score! 🎉</p>
        </div>
      )}
    </div>
  );
};

export default App;