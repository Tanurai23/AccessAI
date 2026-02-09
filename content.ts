type AuditResult = {
  id: string;
  issues: string[];
};

chrome.runtime.onMessage.addListener(
  (
    request: { action: string },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: { audits: AuditResult[] }) => void
  ) => {
    if (request.action !== "scan") return;

    const audits: AuditResult[] = [];

    const images = Array.from(document.images);
    const missingAlt = images.filter(
      img => !img.alt || img.alt.trim() === ""
    );

    if (missingAlt.length) {
      audits.push({
        id: "alt-text",
        issues: [`${missingAlt.length} images missing alt text`],
      });
    }

    sendResponse({ audits });

    return true;
  }
);
