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

# So What this can do?
- 업무 요청을 자동으로 issue로 등록하고, 진행 상태를 변경하고, 관리해주는 ai 비서를 만들어보자.

# Concept
📌 1. Create Jira Issue
<img width="780" height="380" alt="Image" src="https://github.com/user-attachments/assets/38acc82b-7e95-40ed-ba74-80f1f277bb40" />
📌 2. Assgin PIC by Emoji Reaction 
<img width="447" height="396" alt="Image" src="https://github.com/user-attachments/assets/51d33717-fdc2-40a2-9923-8cef646e3e96" />
📌 3. Transition Update Emoji Reaction 
<img width="813" height="400" alt="Image" src="https://github.com/user-attachments/assets/bcc0e668-574d-4c2d-b980-23a24a96e652" />




## 🎥 Demo - Slack Issue Bot
https://github.com/user-attachments/assets/fa3fcf38-bb9e-4f78-b96c-d59e1f0ac3ed
