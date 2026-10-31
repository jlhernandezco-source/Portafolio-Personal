@echo off
echo ========================================
echo Subiendo archivos a GitHub...
echo ========================================

:: Agrega todos los archivos modificados
git add .

:: Solicita un mensaje para el commit
set /p mensaje="Escribe el mensaje del commit: "

:: Realiza el commit con el mensaje ingresado
git commit -m "%mensaje%"

:: Sube los cambios a la rama principal (cambia 'main' por 'master' si es necesario)
git push origin main

echo ========================================
echo ¡Ya quedo Jorgito!
echo ========================================
pause