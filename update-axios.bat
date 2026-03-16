@echo off
echo Updating axios imports and API calls...

echo Updating Register.jsx...
powershell -Command "(Get-Content 'frontend\src\pages\Register.jsx') -replace 'import axios from ''axios''', 'import api from ''../api/config''' | Set-Content 'frontend\src\pages\Register.jsx'"
powershell -Command "(Get-Content 'frontend\src\pages\Register.jsx') -replace 'axios\.', 'api.' | Set-Content 'frontend\src\pages\Register.jsx'"
powershell -Command "(Get-Content 'frontend\src\pages\Register.jsx') -replace '/api/', '/' | Set-Content 'frontend\src\pages\Register.jsx'"

echo Updating Login.jsx...
powershell -Command "(Get-Content 'frontend\src\pages\Login.jsx') -replace 'import axios from ''axios''', 'import api from ''../api/config''' | Set-Content 'frontend\src\pages\Login.jsx'"
powershell -Command "(Get-Content 'frontend\src\pages\Login.jsx') -replace 'axios\.', 'api.' | Set-Content 'frontend\src\pages\Login.jsx'"
powershell -Command "(Get-Content 'frontend\src\pages\Login.jsx') -replace '/api/', '/' | Set-Content 'frontend\src\pages\Login.jsx'"

echo Done!