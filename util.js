// util.js
const fs = require('fs');
const path = require('path');



// ── 필드 추출 (마크다운/일반 텍스트 대응)
function extractField(text, label) {
  const regex = new RegExp(`${label}\\s*:\\s*(.+)`, 'i');
  const lines = text.split('\n');
  for (const line of lines) {
    const match = line.match(regex);
    if (match) return match[1].trim();
  }
  return null;
}

// ── 이모지 → Jira 상태 매핑
function getStatusFromEmoji(reaction) {
console.log('[reaction_added] emoji =',reaction);
  const map = {
    //todo: 'TO DO',
    wip: 'In Progress',
    resolved: 'IN REVIEW',
    'done-': 'DONE'
  };
  return map[reaction];
}

const STORAGE_PATH = path.join(__dirname, 'data');
if (!fs.existsSync(STORAGE_PATH)) {
	fs.mkdirSync(STORAGE_PATH);
}



// ── 메시지 ↔ 이슈 키 매핑 저장 (파일기반)
function saveMessageIssueMap(ts, issueKey) {
  const filePath = path.join(STORAGE_PATH, `${ts}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ issueKey }, null, 2));
}

// ── 메시지 TS로 이슈 키 로드 (비동기)
function getIssueKeyFromMessage(ts) {
  const filePath = path.join(STORAGE_PATH, `${ts}.json`);
  try {
    const data = fs.readFileSync(filePath, 'utf-8'); 
    return JSON.parse(data).issueKey;
  } catch {
    return null;
  }
}

module.exports = {
  extractField,
  getStatusFromEmoji,
  saveMessageIssueMap,
  getIssueKeyFromMessage
};

