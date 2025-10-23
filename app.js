require('dotenv').config();
const { App, LogLevel } = require('@slack/bolt');
const {
  handleAppMention,
  handleReactionAdded,
  handleReactionRemoved
} = require('./handler');
const SLACK_APP_TOKEN = process.env.ENC_SLACK_APP_TOKEN;
const SLACK_BOT_TOKEN = process.env.ENC_SLACK_BOT_TOKEN;
const SLACK_SIGNING_SECRET = process.env.ENC_SLACK_SIGNING_SECRET;

if (!SLACK_APP_TOKEN || !SLACK_BOT_TOKEN) {
  console.error('❌ Missing Slack tokens in .env');
  process.exit(1);
}


// Slack App 실행
(async () => {
const app = new App({
  appToken: SLACK_APP_TOKEN,
  token: SLACK_BOT_TOKEN,
  socketMode: true,
  signingSecret: SLACK_SIGNING_SECRET,
  logLevel: LogLevel[process.env.LOG_LEVEL] ?? LogLevel.INFO
});

app.event('app_mention', async ({ event, client }) => {
  if (event.text?.includes('Title:') && event.text?.includes('Description:')) {
    return handleAppMention({ event, client });
  }
  // 여기 else 분기로 안내 메시지 넣을지 말지는 handler가 할지 선택 가능
});

app.event('reaction_added', handleReactionAdded);
app.event('reaction_removed', handleReactionRemoved);
  await app.start();
  console.log('⚡ Slack Issue Bot running ');
})();

