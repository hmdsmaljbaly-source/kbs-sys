@echo off
echo Deploying KBS System to Firebase Hosting...
echo Please ensure you are logged in to Firebase. If not, run 'firebase login' first.
npx firebase-tools deploy --only hosting
echo.
echo =======================================================
echo Deployment Complete!
echo Share this link with your workers:
echo https://kbs-system-d9192.web.app
echo =======================================================
pause
