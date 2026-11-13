
const natural = require("natural");

// Natural language processing for SecondChance
const tokenizer = new natural.WordTokenizer();

function analyzeText(text) {
  return tokenizer.tokenize(text);
}

module.exports = { analyzeText };
