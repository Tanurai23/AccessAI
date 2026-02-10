// content.ts - 12 WCAG Rules Scanner
console.log("✅ Content script loaded");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action !== "scan")
        return;
    console.log("📩 Scan request received");
    try {
        const issues = [];
        // =========================
        // RULE 1: Missing alt text (WCAG 1.1.1)
        // =========================
        const images = Array.from(document.images);
        images.forEach((img, index) => {
            const alt = img.getAttribute("alt");
            if (!alt || !alt.trim() || alt === img.src) {
                issues.push({
                    id: `alt-${index}`,
                    type: "alt",
                    severity: "critical",
                    element: img.src || "<image>",
                    description: "Image missing meaningful alt text",
                    fixed: false,
                });
            }
        });
        // =========================
        // RULE 2: Low contrast (WCAG 1.4.3)
        // =========================
        const textElements = document.querySelectorAll("p, span, h1, h2, h3, a, button, label");
        textElements.forEach((el, index) => {
            try {
                const style = window.getComputedStyle(el);
                if (style.color.includes("128") && parseFloat(style.fontWeight || "400") < 500) {
                    issues.push({
                        id: `contrast-${index}`,
                        type: "contrast",
                        severity: "high",
                        element: el.tagName,
                        description: "Potential low contrast text",
                        fixed: false,
                    });
                }
            }
            catch { }
        });
        // =========================
        // RULE 3: Focus visibility (WCAG 2.4.7)
        // =========================
        const focusables = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        focusables.forEach((el, index) => {
            try {
                const style = window.getComputedStyle(el);
                if (style.outline === "none" || style.outlineWidth === "0px") {
                    issues.push({
                        id: `focus-${index}`,
                        type: "focus",
                        severity: "medium",
                        element: el.tagName,
                        description: "Focusable element lacks visible focus indicator",
                        fixed: false,
                    });
                }
            }
            catch { }
        });
        // =========================
        // RULE 4: Missing landmarks (WCAG 1.3.1)
        // =========================
        if (!document.querySelector("main, [role='main']")) {
            issues.push({
                id: "landmark-main",
                type: "landmark",
                severity: "low",
                element: "document",
                description: "Missing main landmark region",
                fixed: false,
            });
        }
        if (!document.querySelector("header, [role='banner']")) {
            issues.push({
                id: "landmark-header",
                type: "landmark",
                severity: "low",
                element: "document",
                description: "Missing header/banner landmark",
                fixed: false,
            });
        }
        if (!document.querySelector("footer, [role='contentinfo']")) {
            issues.push({
                id: "landmark-footer",
                type: "landmark",
                severity: "low",
                element: "document",
                description: "Missing footer/contentinfo landmark",
                fixed: false,
            });
        }
        // =========================
        // RULE 5: Heading hierarchy (WCAG 1.3.1)
        // =========================
        const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
        let lastLevel = 0;
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName[1]);
            if (lastLevel > 0 && level > lastLevel + 1) {
                issues.push({
                    id: `heading-${index}`,
                    type: "heading",
                    severity: "medium",
                    element: heading.tagName,
                    description: `Heading skips level (jumped from H${lastLevel} to H${level})`,
                    fixed: false,
                });
            }
            lastLevel = level;
        });
        // =========================
        // RULE 6: Form labels (WCAG 1.3.1, 3.3.2)
        // =========================
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
        inputs.forEach((input, index) => {
            const id = input.getAttribute("id");
            const ariaLabel = input.getAttribute("aria-label");
            const ariaLabelledBy = input.getAttribute("aria-labelledby");
            const hasLabel = id && document.querySelector(`label[for="${id}"]`);
            if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
                issues.push({
                    id: `form-label-${index}`,
                    type: "form-label",
                    severity: "high",
                    element: input.tagName,
                    description: "Form input missing accessible label",
                    fixed: false,
                });
            }
        });
        // =========================
        // RULE 7: Link text (WCAG 2.4.4)
        // =========================
        const links = document.querySelectorAll("a");
        links.forEach((link, index) => {
            const text = link.textContent?.trim() || "";
            const ariaLabel = link.getAttribute("aria-label");
            if (!text && !ariaLabel) {
                issues.push({
                    id: `link-text-${index}`,
                    type: "link-text",
                    severity: "high",
                    element: "A",
                    description: "Link has no accessible text",
                    fixed: false,
                });
            }
            else if (["click here", "read more", "here", "more"].includes(text.toLowerCase())) {
                issues.push({
                    id: `link-text-generic-${index}`,
                    type: "link-text",
                    severity: "medium",
                    element: "A",
                    description: `Link has generic text: "${text}"`,
                    fixed: false,
                });
            }
        });
        // =========================
        // RULE 8: Page language (WCAG 3.1.1)
        // =========================
        const htmlElement = document.documentElement;
        if (!htmlElement.getAttribute("lang")) {
            issues.push({
                id: "lang-missing",
                type: "lang",
                severity: "high",
                element: "HTML",
                description: "Page missing language attribute",
                fixed: false,
            });
        }
        // =========================
        // RULE 9: ARIA usage (WCAG 4.1.2)
        // =========================
        const ariaElements = document.querySelectorAll("[aria-hidden]");
        ariaElements.forEach((el, index) => {
            const ariaHidden = el.getAttribute("aria-hidden");
            const isFocusable = el.matches('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
            if (ariaHidden === "true" && isFocusable) {
                issues.push({
                    id: `aria-${index}`,
                    type: "aria",
                    severity: "critical",
                    element: el.tagName,
                    description: "Focusable element hidden from screen readers",
                    fixed: false,
                });
            }
        });
        // =========================
        // RULE 10: Semantic HTML (WCAG 1.3.1)
        // =========================
        const divButtons = document.querySelectorAll('div[onclick], span[onclick]');
        divButtons.forEach((el, index) => {
            issues.push({
                id: `semantic-${index}`,
                type: "semantic",
                severity: "medium",
                element: el.tagName,
                description: "Non-semantic element used as interactive control",
                fixed: false,
            });
        });
        // =========================
        // RULE 11: Keyboard accessibility (WCAG 2.1.1)
        // =========================
        const clickableNonButtons = document.querySelectorAll('div[onclick]:not([tabindex]), span[onclick]:not([tabindex])');
        clickableNonButtons.forEach((el, index) => {
            issues.push({
                id: `keyboard-${index}`,
                type: "keyboard",
                severity: "critical",
                element: el.tagName,
                description: "Interactive element not keyboard accessible",
                fixed: false,
            });
        });
        // =========================
        // RULE 12: Table structure (WCAG 1.3.1)
        // =========================
        const tables = document.querySelectorAll("table");
        tables.forEach((table, index) => {
            const hasHeaders = table.querySelector("th");
            const hasCaption = table.querySelector("caption");
            const hasScope = table.querySelector("th[scope]");
            if (!hasHeaders) {
                issues.push({
                    id: `table-headers-${index}`,
                    type: "table",
                    severity: "high",
                    element: "TABLE",
                    description: "Table missing header cells (<th>)",
                    fixed: false,
                });
            }
            if (!hasCaption && !table.getAttribute("aria-label")) {
                issues.push({
                    id: `table-caption-${index}`,
                    type: "table",
                    severity: "medium",
                    element: "TABLE",
                    description: "Table missing caption or aria-label",
                    fixed: false,
                });
            }
        });
        console.log("✅ Scan complete:", issues.length, "issues");
        sendResponse({ issues });
    }
    catch (err) {
        console.error("❌ Scanner crashed:", err);
        sendResponse({
            issues: [],
            error: "Scan failed due to runtime error",
        });
    }
    return true;
});
