// handlers.js
const {
  createJiraIssue,
  assignJiraIssue,
  updateJiraStatus
} = require('./jira');

const {
  extractField,
  getIssueKeyFromMessage,
  saveMessageIssueMap,
  getStatusFromEmoji
} = require('./util');

const userMap = require('./userMap.json');

async function handleAppMention({ event, client }) {
  console.log('[DEBUG] app_mention 이벤트 수신됨');
  console.log('[DEBUG] 전체 event:', JSON.stringify(event, null, 2));
  console.log('[DEBUG] user:', event.user);
  console.log('[DEBUG] text:', event.text);

  const { text, thread_ts, ts, channel } = event;
  const title = extractField(text, 'Title');
  const description = extractField(text, 'Description');
  const parentTs = thread_ts || ts;

  console.log('Title:', title);
  console.log('Description:', description);

  if (!title || !description) {
    console.warn('[WARN] Title 또는 Description이 누락되어 Jira 이슈를 생성하지 않음');
    return;
  }

  try {
    const issueKey = await createJiraIssue(title, description);
    await saveMessageIssueMap(parentTs, issueKey);

    await client.chat.postMessage({
      channel,
      thread_ts: parentTs,
      text: `🎟️ Jira ticket created: ${process.env.JIRA_BASE_URL}/browse/${issueKey}`
    });
  } catch (err) {
    console.error('[ERROR] Jira 이슈 생성 중 오류:', err.message);
  }
}

async function handleReactionAdded({ event, client }) {
  const { reaction, item, user } = event;
  const ts = item.ts;
  const channel = item.channel;

  const issueKey = await getIssueKeyFromMessage(ts);
  if (!issueKey) {
    console.warn(`[WARN] message TS(${ts})에 대한 Jira 이슈가 없음`);
    return;
  }

  // 상태 변경 처리
  if (['wip', 'resolved', 'done_'].includes(reaction)) {
    const status = getStatusFromEmoji(reaction);
    try {
      await updateJiraStatus(issueKey, status);
      await client.chat.postMessage({
        channel,
        thread_ts: ts,
        text: `🔄 Issue *${issueKey}* moved to *${status}*`
      });
    } catch (err) {
      console.error(
        `[ERROR] Jira 상태 변경 실패 (${issueKey}):`,
        err.response?.data || err.message
      );
    }
    return;
  }

  // 이슈 assign 처리
  const jiraAccountId = userMap[user];
  if (!jiraAccountId) {
    console.warn(`[WARN] Slack 사용자 ${user} → Jira accountId 매핑 없음`);
    return;
  }

  try {
    await assignJiraIssue(issueKey, jiraAccountId);
    // 필요 시 안내 메시지 재활성화
    // await client.chat.postMessage({
    //   channel,
    //   thread_ts: ts,
    //   text: `✅ Assigned <@${user}> to *${issueKey}*`
    // });
  } catch (err) {
    console.error(
      `[ERROR] Jira 이슈 할당 실패 (${issueKey}):`,
      err.response?.data || err.message
    );
  }
}

async function handleReactionRemoved({ event, client }) {
  const { reaction, item } = event;
  const ts = item.ts;
  const channel = item.channel;

  const issueKey = await getIssueKeyFromMessage(ts);
  if (!issueKey) return;

  // 이전 상태로 되돌리는 맵 정의
  const previousStatusMap = {
    'done_': 'In Review',
    resolved: 'In Progress',
    wip: 'To Do'
  };

  const newStatus = previousStatusMap[reaction];
  if (!newStatus) {
    console.log(`⚠️ 처리하지 않는 이모지 제거됨: ${reaction}`);
    return;
  }

  try {
    await updateJiraStatus(issueKey, newStatus);
    await client.chat.postMessage({
      channel,
      thread_ts: ts,
      text: `⏪ *${issueKey}* status is back into *${newStatus}* status (이모지 제거 감지)`
    });
  } catch (err) {
    console.error(
      `[ERROR] Jira 상태 복구 실패 (${issueKey}):`,
      err.response?.data || err.message
    );
  }
}

module.exports = {
  handleAppMention,
  handleReactionAdded,
  handleReactionRemoved
};

