// Free limits
const FREE_LIMITS = {
  scans: 5,      // /day
  saved: 3,      // max saved scans
  reports: 0     // no PDF exports
};

// Check pro status (Chrome storage + Stripe webhook)
export const getProStatus = async (): Promise<'free' | 'pro'> => {
  const { proUntil, stripeId } = await chrome.storage.sync.get(['proUntil', 'stripeId']);
  return new Date(proUntil || 0) > new Date() ? 'pro' : 'free';
};

export const trackUsage = async (action: 'scan' | 'save' | 'export') => {
  const status = await getProStatus();
  if (status === 'pro') return true;
  
  const usage = await chrome.storage.local.get('usage') || { scans: 0 };
  usage[action + 's'] = (usage[action + 's'] || 0) + 1;
  await chrome.storage.local.set(usage);
  
  return usage[action + 's'] <= FREE_LIMITS[action + 's' as keyof typeof FREE_LIMITS];
};