// jira.js
const axios = require('axios');

function getAuthConfig() {
  return {
    auth: {
      username: process.env.JIRA_EMAIL,       // 이메일
      password: process.env.JIRA_API_TOKEN    // API Token(PAT)
    },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
}

/**
 * Atlassian Agile API 클라이언트 (Scrum 보드/스프린트 제어)
 */
function agile() {
  const base = process.env.JIRA_BASE_URL;
  const projectKey = process.env.JIRA_PROJECT_KEY;
  const preferBoardId = (process.env.JIRA_BOARD_ID || '').trim(); // 특정 보드 고정(선택)

  async function findBoardsByProject() {
    const { data } = await axios.get(
      `${base}/rest/agile/1.0/board`,
      { ...getAuthConfig(), params: { projectKeyOrId: projectKey, type: 'scrum' } }
    );
    return data.values || [];
  }

  async function resolveBoardId() {
    if (preferBoardId) return preferBoardId;
    const boards = await findBoardsByProject();
    return boards[0]?.id || null; // 첫 번째 Scrum 보드
  }

  async function getActiveSprint(boardId) {
    const { data } = await axios.get(
      `${base}/rest/agile/1.0/board/${boardId}/sprint`,
      { ...getAuthConfig(), params: { state: 'active' } }
    );
    return (data.values || [])[0] || null;
  }

  async function addIssuesToSprint(sprintId, issueKeys) {
    await axios.post(
      `${base}/rest/agile/1.0/sprint/${sprintId}/issue`,
      { issues: issueKeys },
      getAuthConfig()
    );
  }

  /**
   * 활성 스프린트가 있으면 해당 스프린트에 issueKey를 추가
   * @returns {Promise<boolean>} 추가 성공 시 true, 활성 스프린트 없음/보드 없음 시 false
   */
  async function addIssueToActiveSprint(issueKey) {
    const boardId = await resolveBoardId();
    if (!boardId) return false;
    const sprint = await getActiveSprint(boardId);
    if (!sprint) return false;
    await addIssuesToSprint(sprint.id, [issueKey]);
    return true;
  }

  return { addIssueToActiveSprint };
}

/**
 * Jira 이슈 생성
 * - 옵션: JIRA_AUTO_ADD_TO_ACTIVE_SPRINT=true 이면 생성 직후 활성 스프린트에 자동 투입
 */
async function createJiraIssue(title, descriptionText) {
  const description = {
    type: 'doc',
    version: 1,
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: descriptionText }] }
    ]
  };

  const payload = {
    fields: {
      project: { key: process.env.JIRA_PROJECT_KEY },
      summary: title,
      description,
      issuetype: { name: 'Task' }
    }
  };

  try {
    const res = await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      payload,
      getAuthConfig()
    );
    const issueKey = res.data.key;

    // ── 생성 직후 활성 스프린트 자동 추가 (옵션) ────────────────────────────────
    if (String(process.env.JIRA_AUTO_ADD_TO_ACTIVE_SPRINT || '').toLowerCase() === 'true') {
      try {
        const ok = await agile().addIssueToActiveSprint(issueKey);
        if (!ok) {
          console.log(`[Sprint] 활성 스프린트가 없거나 보드를 찾지 못함 → ${issueKey} 백로그 유지`);
        } else {
          console.log(`[Sprint] 활성 스프린트에 자동 추가됨 → ${issueKey}`);
        }
      } catch (e) {
        console.error('[Sprint] 자동 추가 실패:', e?.response?.data || e.message);
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    return issueKey;
  } catch (err) {
    console.error('[ERROR] Jira 이슈 생성 실패:', err.response?.data || err.message);
    throw err;
  }
}

/**
 * 이슈를 특정 사용자(accountId)에게 할당
 */
async function assignJiraIssue(issueKey, accountId) {
  try {
    await axios.put(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/assignee`,
      { accountId },
      getAuthConfig()
    );
    console.log(`✅ Assigned ${accountId} to issue ${issueKey}`);
  } catch (err) {
    console.error(`[ERROR] 이슈 할당 실패 (${issueKey}):`, err.response?.data || err.message);
    throw err;
  }
}

/**
 * 이슈 상태 전환
 * - 입력: 전이 이름 또는 목적지 상태 이름(대소문자 무시)
 * - 우선순위: transition.name → transition.to.name
 * - 찾지 못하면 사용 가능한 전이 목록을 에러에 함께 표시
 */
async function updateJiraStatus(issueKey, newStatusName) {
  try {
    const transRes = await axios.get(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`,
      getAuthConfig()
    );

    const transitions = transRes.data.transitions || [];
    const wanted = String(newStatusName || '').trim().toLowerCase();

    // 1) 전이 이름 매칭
    let target = transitions.find(t => (t.name || '').toLowerCase() === wanted);

    // 2) 목적지 상태 이름 매칭 (예: DONE / Complete / 배포됨 등)
    if (!target) {
      target = transitions.find(t => (t.to?.name || '').toLowerCase() === wanted);
    }

    if (!target) {
      const names = transitions.map(t => `${t.id}:${t.name} -> ${t.to?.name}`).join(', ');
      console.error(`[ERROR] 상태 변경 실패: '${newStatusName}' 전환 없음. Available: [${names}]`);
      throw new Error(`No transition found for status: ${newStatusName}`);
    }

    await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`,
      { transition: { id: target.id } },
      getAuthConfig()
    );

    console.log(`🔄 상태 변경 완료: ${issueKey} → ${newStatusName}`);
  } catch (err) {
    console.error(`[ERROR] 상태 변경 중 오류 (${issueKey}):`, err.response?.data || err.message);
    throw err;
  }
}

module.exports = {
  createJiraIssue,
  assignJiraIssue,
  updateJiraStatus,
  // 추가 export (원한다면 핸들러에서 직접 호출 가능)
  addIssueToActiveSprint: agile().addIssueToActiveSprint
};

