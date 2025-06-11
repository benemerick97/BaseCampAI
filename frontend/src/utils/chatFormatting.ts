export const applyHighlighting = (text: string): string => {
  return text
    // 🛠 Fix: Preserve bullet + text in the same line
    .replace(/^\s*•\s*[\r\n]+\s*(.+)/gm, "- $1")  // handles split bullets
    .replace(/^\s*•\s+(.+)/gm, "- $1")            // handles inline bullets

    // Highlight helpers
    .replace(/(?<=\bowner[s]?:\s?)([A-Za-z\s]+)/gi, "**$1**")
    .replace(/\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g, "**$1**")
    .replace(/\b(Q\d\s+\d{4})\b/gi, "**$1**")

    // Optional cleanup
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
