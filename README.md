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
📌 1. Create Jira Issue
![issue screen shot](https://private-user-images.githubusercontent.com/96724602/504509477-31c9ee26-ce4a-4adb-b565-cdd9e2416ac1.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjExOTAzNzYsIm5iZiI6MTc2MTE5MDA3NiwicGF0aCI6Ii85NjcyNDYwMi81MDQ1MDk0NzctMzFjOWVlMjYtY2U0YS00YWRiLWI1NjUtY2RkOWUyNDE2YWMxLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTEwMjMlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUxMDIzVDAzMjc1NlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTA0Zjg5ZjRiZjJlYzMzNjJlZDZlYzI2OTdmNjU1MzBjYjg1NzIxMjk4MWNhODkxMmMyNTU0NzRjNmIyNjllOGImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.LFgZK4w2hBfBrw5i-stDCVnDkRxQxm33yruP81mZWA0)
📌 2. Assgin PIC by Emoji Reaction 


📌 3. Transition Update Emoji Reaction 

# So What this can do?

- 업무 요청을 자동으로 issue로 등록하고, 진행 상태를 변경하고, 관리해주는 ai 비서를 만들어보자.


## 🎥 Demo - Slack Issue Bot
https://github.com/user-attachments/assets/2f98c858-bb0b-4559-b1de-296d32a55d69
