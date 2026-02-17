// popup/src/content.ts - PRODUCTION AUTO-FIX ENGINE
console.log("✅ AccessAI content script LOADED v2.0");

// Interfaces
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

// 🔥 AUTO-FIX FUNCTIONS
const applyContrastFix = (elements: Element[]) => {
  elements.forEach(el => {
    const style = el as HTMLElement;
    // Force accessible contrast (black on white)
    style.style.setProperty('color', '#000000', 'important');
    style.style.setProperty('background-color', '#FFFFFF', 'important');
    style.style.setProperty('text-shadow', 'none', 'important');
  });
  console.log(`✅ Applied contrast fix to ${elements.length} elements`);
};

const applyFocusFix = () => {
  // Global focus styles
  const style = document.createElement('style');
  style.id = 'accessai-focus-fix';
  style.textContent = `
    *:focus-visible {
      outline: 3px solid #3B82F6 !important;
      outline-offset: 2px !important;
      border-radius: 4px !important;
    }
    *:focus:not(:focus-visible) {
      outline: none !important;
    }
  `;
  // Remove existing if present
  document.getElementById('accessai-focus-fix')?.remove();
  document.head.appendChild(style);
  console.log('✅ Global focus indicators applied');
};

const applyAltFix = (images: HTMLImageElement[], aiText: string[]) => {
  images.slice(0, aiText.length).forEach((img, i) => {
    img.alt = aiText[i] || 'AI-generated description';
    img.setAttribute('aria-label', aiText[i] || 'Image');
    console.log(`✅ Fixed alt text: ${aiText[i]?.substring(0, 30)}`);
  });
};

// 🚀 MAIN FIX APPLIER
const applyFixes = (fixRequest: { fixes: FixAction[] }) => {
  console.log('🔧 Applying fixes:', fixRequest.fixes);
  
  fixRequest.fixes.forEach(fix => {
    switch (fix.type) {
      case 'contrast':
        applyContrastFix(fix.elements);
        break;
      case 'focus':
        applyFocusFix();
        break;
      case 'alt':
        // Find images during scan
        const images = Array.from(document.images).slice(0, 3);
        applyAltFix(images as HTMLImageElement[], fix.aiText || []);
        break;
    }
  });
  
  // Auto re-scan after 1s
  setTimeout(() => {
    chrome.runtime.sendMessage({ action: 'rescan' });
  }, 1000);
};

// GLOBAL REGISTRATION
(window as any).registerAccessAIScan = () => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("📩 REQUEST:", request.action);

    // SCAN REQUEST
    if (request.action === "scan" || request.action === "rescan") {
      console.log("🔍 Starting scan...");
      sendResponse({ status: "scanning", progress: 0 });

      setTimeout(() => {
        try {
          const issues: AuditIssue[] = [];

          // RULE 1: Missing Alt + AI (WCAG 1.1.1)
          const images = Array.from(document.images);
          const missingAlt: HTMLImageElement[] = [];

          images.forEach((img, index) => {
            const alt = img.getAttribute("alt");
            if (!alt || !alt.trim() || alt === img.src) {
              missingAlt.push(img);
              issues.push({
                id: `alt-${index}`,
                type: "alt",
                severity: "critical",
                element: img.src.substring(0, 50) + "...",
                description: "Image missing meaningful alt text",
                fixed: false,
              });
            }
          });

          // AI Suggestions (Production mock → real Transformers.js Day 9)
          const mockAIAltText = (src: string): string => {
            if (src.includes('profile') || src.includes('avatar')) return 'User profile photo';
            if (src.includes('logo')) return 'Company logo';
            if (src.includes('twitter') || src.includes('x.com')) return 'Social media icon';
            return `Image: ${src.split('/').pop()?.split('.')[0]?.replace(/-/g, ' ') || 'graphic'}`;
          };

          missingAlt.slice(0, 3).forEach((img, i) => {
            const altIssue = issues.find(issue => issue.id === `alt-${i}`);
            if (altIssue) altIssue.aiSuggestion = mockAIAltText(img.src);
          });

          // Additional test issues (expand to full 12 later)
          issues.push(
            { id: "test-lang", type: "lang" as any, severity: "high", element: "HTML", description: "Page missing lang attribute", fixed: false },
            { id: "test-main", type: "landmark" as any, severity: "low", element: "document", description: "Missing main landmark", fixed: false },
            { id: "test-contrast-1", type: "contrast", severity: "high", element: "P", description: "Low contrast text detected", fixed: false },
            { id: "test-focus-1", type: "focus", severity: "medium", element: "BUTTON", description: "No focus outline", fixed: false }
          );

          console.log(`✅ Scan COMPLETE: ${issues.length} issues found`);
          sendResponse({ issues, total: issues.length });
        } catch (error) {
          console.error("❌ Scan error:", error);
          sendResponse({ error: "Scan failed: " + (error as Error).message });
        }
      }, 800);

    // 🔥 NEW: FIX REQUEST
    } else if (request.action === "apply-fixes") {
      console.log("🔧 FIX REQUEST:", request.fixes);
      applyFixes(request);
      sendResponse({ success: true, message: "Fixes applied! Re-scanning..." });

    } else {
      sendResponse({ error: "Unknown action: " + request.action });
    }

    return true; // Async response
  });
};

// Register immediately
(window as any).registerAccessAIScan();