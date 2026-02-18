// Pro-only: Persist scan history
interface SavedScan {
  id: string;
  url: string;
  score: number;
  date: string;
  issues: AuditIssue[];
}

const SavedScans = () => {
  const [scans, setScans] = useState<SavedScan[]>([]);
  const [isPro] = useProStatus();

  const saveCurrentScan = async () => {
    if (!isPro || !(await trackUsage('save'))) {
      showUpgrade();
      return;
    }
    
    const scan: SavedScan = {
      id: crypto.randomUUID(),
      url: currentUrl,
      score: currentScore,
      date: new Date().toISOString(),
      issues: currentAudits
    };
    
    const saved = await chrome.storage.sync.get('savedScans') || [];
    saved.push(scan);
    await chrome.storage.sync.set({ savedScans });
    toast('Scan saved!');
  };

  return isPro ? (
    <div className="space-y-2">
      <Button onClick={saveCurrentScan} variant="outline">
        💾 Save Scan
      </Button>
      {scans.map(scan => (
        <ScanCard key={scan.id} scan={scan} />
      ))}
    </div>
  ) : (
    <ProTeaser feature="saved scans" />
  );
};