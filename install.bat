@echo off
chcp 65001 >nul
echo ========================================
echo   众生界 - 依赖安装
echo ========================================
echo.
echo 正在安装依赖，请稍候……
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [错误] 依赖安装失败，请检查 Node.js 环境。
    pause
    exit /b 1
)
echo.
echo [完成] 依赖安装成功。
pause
