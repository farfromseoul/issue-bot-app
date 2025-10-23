# issue-bot-app
slack-wf-automation-backend
# Developement Enviroment

- Windows 10 local desktop
- wsl2 ubuntu with docker desktop.

# Base Utility

- **scm**: git
- **Running platform**: docker container based
- **Application**: npm,node,pm2,ansible(for vault secret)
- **security for credential**: harshicorp vault

## WSL Install

- wsl --install -d Ubuntu
- wsl --shutdown
- wsl
- 또는 재부팅하여, id/pw 생성

## Docker Desktop Install

- 4.48.0 install (공식 가이드 참조)

## Slack

- private or public channel
- WF
- slack app(bot) and  config

## Bolt app (js)

- node js based

## source tree

├── Dockerfile
├── [README.md](http://readme.md/)
├── app.js
├── handler.js
├── jira.js
├── package.json
├── userMap.json
└── util.js

# Concept
[![GitHub issue](https://img.shields.io/github/issues-detail/farfromseoul/issue-bot-app/1)](https://github.com/farfromseoul/issue-bot-app/issues/1)

# So What this can do?

- 업무 요청을 자동으로 issue로 등록하고, 진행 상태를 변경하고, 관리해주는 ai 비서를 만들어보자.

