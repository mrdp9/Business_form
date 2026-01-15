@echo off
echo Running docker info... > deployment_log.txt
docker info >> deployment_log.txt 2>&1
echo. >> deployment_log.txt
echo Running docker compose build and up... >> deployment_log.txt
docker compose -f docker-compose.yaml up -d --build >> deployment_log.txt 2>&1
echo Done. >> deployment_log.txt
