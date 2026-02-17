console.log("✅ AccessAI content script LOADED v2.1 - VISION AI");

// 🔥 IMPORT AI (Day 9)
let aiInitialized = false;

interface AuditIssue {
  id: string;
  type: 'alt' | 'contrast' | 'focus' | 'landmark' | 'heading' | 'form-label' | 'link-text' | 'lang' | 'aria' | 'semantic' | 'keyboard' | 'table';
  severity: 'critical' | 'high' | 'medium' | 'low';
  element: string;
  description: string;
  fixed: boolean;
  aiSuggestion?: string;
}

interface FixAction {
  type: 'alt' | 'contrast' | 'focus';
  elements: Element[];
  aiText?: string[];
}

// 🔥 AUTO-FIX FUNCTIONS (Enhanced)
const applyContrastFix = (elements: Element[]) => {
  elements.forEach(el => {
    const style = el as HTMLElement;
    style.style.setProperty('color', '#000000', 'important');
    style.style.setProperty('background-color', '#FFFFFF', 'important');
    style.style.setProperty('text-shadow', 'none', 'important');
  });
  console.log(`✅ Applied contrast fix to ${elements.length} elements`);
};

const applyFocusFix = () => {
  const style = document.createElement('style');
  style.id = 'accessai-focus-fix';
  style.textContent = `
    *:focus-visible {
      outline: 3px solid #3B82F6 !important;
      outline-offset: 2px !important;
      border-radius: 4px !important;
    }
  `;
  document.getElementById('accessai-focus-fix')?.remove();
  document.head.appendChild(style);
  console.log('✅ Global focus indicators applied');
};

const applyAltFix = async (images: HTMLImageElement[], aiTexts: string[]) => {
  for (let i = 0; i < Math.min(images.length, aiTexts.length); i++) {
    const img = images[i];
    img.alt = aiTexts[i];
    img.setAttribute('aria-label', aiTexts[i]);
    // Visual feedback
    img.style.border = '3px solid #10B981';
    img.style.transition = 'border 0.3s';
    setTimeout(() => {
      img.style.border = '';
    }, 3000);
    console.log(`✅ AI Alt applied: ${aiTexts[i]?.substring(0, 30)}`);
  }
};

// 🔥 MAIN FIX APPLIER
const applyFixes = async (fixRequest: { fixes: FixAction[] }) => {
  console.log('🔧 Applying AI fixes:', fixRequest.fixes);
  
  for (const fix of fixRequest.fixes) {
    switch (fix.type) {
      case 'contrast':
        applyContrastFix(fix.elements);
        break;
      case 'focus':
        applyFocusFix();
        break;
      case 'alt':
        // Use document images for alt fixes
        const images = Array.from(document.querySelectorAll('img:not([alt]):not([aria-label])')) as HTMLImageElement[];
        await applyAltFix(images.slice(0, 5), fix.aiText || []);
        break;
    }
  }
  
  setTimeout(() => chrome.runtime.sendMessage({ action: 'rescan' }), 1500);
};

// 🔥 REAL AI ALT SCANNER (Day 9)
const scanMissingAltAI = async (): Promise<AuditIssue[]> => {
  const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
  const missingAlt = images.filter(img => 
    !img.alt?.trim() || img.alt === img.src
  );
  
  console.log(`🤖 AI scanning ${missingAlt.length} images...`);
  const issues: AuditIssue[] = [];
  
  // Process top 8 images (performance)
  for (let i = 0; i < Math.min(8, missingAlt.length); i++) {
    const img = missingAlt[i];
    try {
      console.log(`🤖 Analyzing image ${i + 1}:`, img.src.slice(-40));
      const aiText = await (window as any).generateAltText(img);
      
      issues.push({
        id: `ai-alt-${i}`,
        type: 'alt',
        severity: 'critical',
        element: img.src.substring(img.src.lastIndexOf('/') + 1),
        description: 'Image missing meaningful alt text',
        fixed: false,
        aiSuggestion: aiText
      });
    } catch (e) {
      console.warn(`❌ AI failed for image ${i}:`, e);
      // Fallback mock
      issues.push({
        id: `alt-${i}`,
        type: 'alt',
        severity: 'critical',
        element: img.src.substring(img.src.lastIndexOf('/') + 1),
        description: 'Image missing alt text',
        fixed: false,
        aiSuggestion: 'AI-generated description'
      });
    }
  }
  
  return issues;
};

// 🔥 FULL SCANNER
const runFullScan = async (): Promise<{issues: AuditIssue[], total: number}> => {
  console.log('🔍 Starting full AI scan...');
  
  // Init AI first time
  if (!aiInitialized) {
    try {
      await (window as any).initAI();
      aiInitialized = true;
    } catch (e) {
      console.error('❌ AI init failed:', e);
    }
  }
  
  const issues: AuditIssue[] = [];
  
  // 🔥 AI Alt Text (Priority #1)
  const aiAlts = await scanMissingAltAI();
  issues.push(...aiAlts);
  
  // Additional rules (mock for now → expand Day 10+)
  issues.push(
    { id: "contrast-1", type: "contrast", severity: "high", element: "Text", description: "Low contrast detected", fixed: false },
    { id: "focus-1", type: "focus", severity: "medium", element: "Buttons", description: "Missing focus outlines", fixed: false },
    { id: "landmark-1", type: "landmark" as any, severity: "low", element: "Page", description: "Missing main landmark", fixed: false }
  );
  
  console.log(`✅ Scan COMPLETE: ${issues.length} issues (${aiAlts.length} AI-powered)`);
  return { issues, total: issues.length };
};

// 🔥 MESSAGE HANDLER
(window as any).registerAccessAIScan = () => {
  chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
    console.log("📩 REQUEST:", request.action);

    if (request.action === "scan" || request.action === "rescan") {
      runFullScan().then(sendResponse).catch(e => {
        console.error("❌ Scan error:", e);
        sendResponse({ error: "Scan failed" });
      });
      
    } else if (request.action === "apply-fixes") {
      applyFixes(request).then(() => {
        sendResponse({ success: true, message: "AI fixes applied!" });
      });
      
    } else {
      sendResponse({ error: "Unknown action" });
    }

    return true; // Keep message channel open for async
  });
};

// 🔥 EXPOSE AI FUNCTIONS TO CONTENT SCRIPT (for popup/App.tsx)
(window as any).initAI = async () => {
  // Dynamically import ai.ts in content script context
  if (!(window as any).generateAltText) {
    const module = await import(chrome.runtime.getURL('/src/ai.js'));
    (window as any).initAI = module.initAI;
    (window as any).generateAltText = module.generateAltText;
    await module.initAI();
  }
};

// Auto-register
(window as any).registerAccessAIScan();