const testTexts = [
  "MRP ₹ (incl. of all taxes) : 303.00",
  "MRP Z (incl. of all taxes) : 303.00",
  "MRP (inci. of all taxes) : 303.00",
  "MRP (incl of ali taxes) : 303.00",
  "MRP (incl. of all tax) : 303.00",
  "MRP\n(incl. of all taxes)\n: 303.00",
  "MRP 303.00 (incl of all taxes)",
  "MRP ₹ 303.00\n(incl. of all taxes)",
  "MRP ₹ (incl. of all taxes)\n303.00",
  "303.00\n(incl. of all taxes)",
  "MRP : 303.00\ntaxes included"
];

const taxRegex = /(?:inclusive\s*of\s*all\s*taxes|incl[a-z\.]*\s*(?:of)?\s*al[li1][a-z]*\s*tax[a-z]*|all\s*tax[a-z]*\s*incl[a-z]*|inc[li]\.?\s*of\s*all|incl[a-z\.]*\s*tax[a-z]*|tax[a-z]*\s*incl[a-z]*|\btaxes\b|\btax\b|inclusive|incl\b|inci\b)/i;

testTexts.forEach((t, i) => {
  console.log(`Test ${i + 1}: ${taxRegex.test(t)} -> "${t}"`);
});
