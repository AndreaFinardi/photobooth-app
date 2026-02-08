@echo off
echo ==============================================
echo 🎬 INSTALLAZIONE PHOTOBOOTH APP - WINDOWS
echo ==============================================
echo.

REM Verifica prerequisiti
echo 1. Verifica Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js non trovato!
    echo.
    echo Installa Node.js da: https://nodejs.org/
    echo Scegli la versione LTS (Long Term Support)
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js trovato: %node_version%
echo.

REM 2. Crea struttura cartelle
echo 2. Creazione struttura cartelle...
if not exist "photobooth-app" mkdir "photobooth-app"
cd "photobooth-app"

REM Cartelle backend
mkdir backend 2>nul
mkdir backend\src 2>nul
mkdir backend\src\config 2>nul
mkdir backend\src\controllers 2>nul
mkdir backend\src\models 2>nul
mkdir backend\src\routes 2>nul
mkdir backend\src\middleware 2>nul
mkdir backend\src\services 2>nul

REM Cartelle frontend
mkdir frontend 2>nul
mkdir frontend\public 2>nul
mkdir frontend\src 2>nul
mkdir frontend\src\components 2>nul
mkdir frontend\src\components\Auth 2>nul
mkdir frontend\src\components\Room 2>nul
mkdir frontend\src\components\Camera 2>nul
mkdir frontend\src\components\Library 2>nul
mkdir frontend\src\pages 2>nul
mkdir frontend\src\utils 2>nul

REM Altre cartelle
mkdir database 2>nul
mkdir scripts 2>nul

echo ✅ Struttura cartelle creata
echo.

REM 3. Crea file di configurazione
echo 3. Creazione file di configurazione...

REM Crea file README.md
echo # Photobooth App - Installazione per Windows > README.md
echo. >> README.md
echo ## Prerequisiti >> README.md
echo. >> README.md
echo 1. Node.js 18+ >> README.md
echo 2. PostgreSQL (pgAdmin su porta 5433) >> README.md
echo 3. NPM (incluso con Node.js) >> README.md
echo. >> README.md
echo ## Passaggi di installazione >> README.md
echo. >> README.md
echo ### 1. Database PostgreSQL >> README.md
echo. >> README.md
echo - Apri pgAdmin (localhost:5433) >> README.md
echo - Crea nuovo database: photobooth_app >> README.md
echo - Esegui il file database\init.sql >> README.md
echo. >> README.md
echo ### 2. Backend >> README.md
echo. >> README.md
echo ```bash >> README.md
echo cd backend >> README.md
echo npm install >> README.md
echo npm run dev >> README.md
echo ``` >> README.md
echo. >> README.md
echo ### 3. Frontend >> README.md
echo. >> README.md
echo ```bash >> README.md
echo cd frontend >> README.md
echo npm install >> README.md
echo npm start >> README.md
echo ``` >> README.md
echo. >> README.md
echo ## Credenziali demo >> README.md
echo. >> README.md
echo - Email: demo@example.com >> README.md
echo - Password: demo123 >> README.md

REM Crea script per database
echo -- File di inizializzazione database per Photobooth App > database\init.sql
echo -- Eseguire questo script in pgAdmin su localhost:5433 >> database\init.sql
echo. >> database\init.sql
echo -- Crea database (prima eseguire manualmente in pgAdmin) >> database\init.sql
echo -- CREATE DATABASE photobooth_app; >> database\init.sql

REM Crea script per query utili
echo -- Query utili per pgAdmin > database\queries.sql
echo -- Eseguire queste query nel database photobooth_app >> database\queries.sql

echo ✅ File di configurazione creati
echo.

REM 4. Download dei file principali
echo 4. Download dei file principali...
echo (Questo richiede una connessione internet attiva)
echo.

REM Crea file di guida per download manuale
echo @echo off > scripts\download-files.bat
echo echo Scarica i file necessari da: >> scripts\download-files.bat
echo echo https://github.com/yourusername/photobooth-app >> scripts\download-files.bat
echo echo. >> scripts\download-files.bat
echo echo Oppure copia i file manualmente: >> scripts\download-files.bat
echo echo 1. package.json backend >> scripts\download-files.bat
echo echo 2. server.js backend >> scripts\download-files.bat
echo echo 3. package.json frontend >> scripts\download-files.bat
echo echo 4. App.js frontend >> scripts\download-files.bat
echo echo 5. E altri file della struttura... >> scripts\download-files.bat

REM 5. Guide per pgAdmin
echo @echo off > scripts\setup-pgadmin.bat
echo echo ============================================== >> scripts\setup-pgadmin.bat
echo echo CONFIGURAZIONE PGADMIN >> scripts\setup-pgadmin.bat
echo echo ============================================== >> scripts\setup-pgadmin.bat
echo echo. >> scripts\setup-pgadmin.bat
echo echo 1. Apri pgAdmin (localhost:5433) >> scripts\setup-pgadmin.bat
echo echo 2. Connettiti al server PostgreSQL >> scripts\setup-pgadmin.bat
echo echo 3. Clicca destro su Databases ^> Create ^> Database... >> scripts\setup-pgadmin.bat
echo echo 4. Nome database: photobooth_app >> scripts\setup-pgadmin.bat
echo echo 5. Owner: postgres >> scripts\setup-pgadmin.bat
echo echo 6. Clicca Save >> scripts\setup-pgadmin.bat
echo echo. >> scripts\setup-pgadmin.bat
echo echo 7. Seleziona il database photobooth_app >> scripts\setup-pgadmin.bat
echo echo 8. Tools ^> Query Tool >> scripts\setup-pgadmin.bat
echo echo 9. Apri il file database\init.sql >> scripts\setup-pgadmin.bat
echo echo 10. Premi F5 o il pulsante Play per eseguire >> scripts\setup-pgadmin.bat
echo echo. >> scripts\setup-pgadmin.bat
echo pause >> scripts\setup-pgadmin.bat

echo ✅ Script di setup creati
echo.

REM 6. Crea file di configurazione base
echo # Database PostgreSQL (pgAdmin su porta 5433) > backend\.env.example
echo DB_HOST=localhost >> backend\.env.example
echo DB_PORT=5433 >> backend\.env.example
echo DB_NAME=photobooth_app >> backend\.env.example
echo DB_USER=postgres >> backend\.env.example
echo DB_PASSWORD=2008 >> backend\.env.example
echo. >> backend\.env.example
echo # JWT Authentication >> backend\.env.example
echo JWT_SECRET=il_tuo_segreto_super_sicuro_cambia_in_produzione >> backend\.env.example
echo JWT_EXPIRES_IN=7d >> backend\.env.example
echo. >> backend\.env.example
echo # Email (per notifiche) >> backend\.env.example
echo EMAIL_HOST=smtp.gmail.com >> backend\.env.example
echo EMAIL_PORT=587 >> backend\.env.example
echo EMAIL_USER=la_tua_email@gmail.com >> backend\.env.example
echo EMAIL_PASS=la_tua_password_app >> backend\.env.example
echo. >> backend\.env.example
echo # App >> backend\.env.example
echo APP_URL=http://localhost:3000 >> backend\.env.example
echo PORT=3001 >> backend\.env.example
echo NODE_ENV=development >> backend\.env.example

echo REACT_APP_API_URL=http://localhost:3001/api > frontend\.env.example
echo REACT_APP_WS_URL=ws://localhost:3001 >> frontend\.env.example
echo REACT_APP_NAME=Photobooth App >> frontend\.env.example

echo ✅ File di esempio .env creati
echo.

echo ==============================================
echo ✅ INSTALLAZIONE BASE COMPLETATA!
echo ==============================================
echo.
echo 📋 PROSSIMI PASSI:
echo.
echo 1. DATABASE:
echo    - Esegui scripts\setup-pgadmin.bat
echo    - Crea database 'photobooth_app' in pgAdmin
echo    - Esegui database\init.sql
echo.
echo 2. BACKEND:
echo    - Copia backend\.env.example a backend\.env
echo    - Modifica backend\.env con le tue credenziali
echo    - cd backend
echo    - npm install
echo    - npm run dev
echo.
echo 3. FRONTEND:
echo    - Copia frontend\.env.example a frontend\.env
echo    - cd frontend
echo    - npm install
echo    - npm start
echo.
echo 4. ACCEDI ALL'APP:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:3001/api/health
echo.
echo 🔧 PER PROBLEMI:
echo    - Verifica che PostgreSQL sia avviato (porta 5433)
echo    - Controlla le credenziali in backend\.env
echo    - Verifica che le porte 3000 e 3001 siano libere
echo.
echo 💡 ACCOUNT DEMO:
echo    - Email: demo@example.com
echo    - Password: demo123
echo.
pause