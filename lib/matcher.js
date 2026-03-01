const database = require("./database.json");

function findError(input) {
  if (!input) return { count: 0, matches: [] };

  // 1. Normalize the input (Lowercase and remove extra whitespace)
  const lowerInput = input.toLowerCase();
  
  // 2. Filter the database
  let foundMatches = database.filter(entry => {
    const matchPhrase = entry.match.toLowerCase();
    
    // STRICT CHECK: The phrase must exist in the error log
    return lowerInput.includes(matchPhrase);
  });

  // 3. SPECIFICITY SORTING (The Secret Sauce)
  // If we find "Cannot read properties of undefined" AND "TypeError", 
  // we want the longer, more specific one to show up first.
  foundMatches.sort((a, b) => b.match.length - a.match.length);

  // 4. DEDUPLICATION
  // Ensure we don't show the same category twice
  const uniqueMatches = [];
  const seenNames = new Set();

  for (const match of foundMatches) {
    if (!seenNames.has(match.name)) {
      uniqueMatches.push(match);
      seenNames.add(match.name);
    }
  }

  return {
    count: uniqueMatches.length,
    matches: uniqueMatches
  };
}

module.exports = { findError };