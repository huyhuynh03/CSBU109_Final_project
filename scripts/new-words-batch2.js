// ============================================================================
// new-words-batch2.js — Loader: gộp phần A + B thành một array
// Dùng: node scripts/merge-new-words.js --data=./new-words-batch2.js
// ============================================================================
module.exports = [...require('./new-words-batch2-a'), ...require('./new-words-batch2-b')];
