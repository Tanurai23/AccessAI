// pro.ts - Fixed TypeScript + chrome.storage types
interface UsageData {
  scans: number
  saves: number
  exports: number
}

interface ProData {
  proUntil?: string | number
  stripeId?: string
}

const FREE_LIMITS: Record<string, number> = {
  scans: 5,
  saves: 3,
  exports: 0
}

export const getProStatus = async (): Promise<'free' | 'pro'> => {
  const data = await chrome.storage.sync.get<ProData>(['proUntil', 'stripeId'])
  const proUntil = data.proUntil ? new Date(data.proUntil as string | number) : new Date(0)
  return proUntil > new Date() ? 'pro' : 'free'
}

export const trackUsage = async (action: 'scan' | 'save' | 'export'): Promise<boolean> => {
  const status = await getProStatus()
  if (status === 'pro') return true
  
  const usageData = await chrome.storage.local.get<UsageData>('usage')
  const usage = usageData.usage || { scans: 0, saves: 0, exports: 0 }
  
  const count = (usage[action + 's'] || 0) + 1
  usage[action + 's'] = count
  
  await chrome.storage.local.set({ usage })
  
  const limit = FREE_LIMITS[action + 's']
  return typeof limit === 'number' ? count <= limit : false
}