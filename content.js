"use strict";
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action !== "scan")
        return;
    const audits = [];
    const images = Array.from(document.images);
    const missingAlt = images.filter(img => !img.alt || img.alt.trim() === "");
    if (missingAlt.length) {
        audits.push({
            id: "alt-text",
            issues: [`${missingAlt.length} images missing alt text`],
        });
    }
    sendResponse({ audits });
    return true;
});
