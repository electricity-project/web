#!/bin/sh
set -e

if [ "$#" -lt 1 ]; then
    echo "You have to pass ssh configuration for example 'ubuntu@ip_address -p <PORT>'"
    exit 1
fi

ssh_configuration="$1"

docker build -t web:latest ../ --no-cache

echo "Start uploading  web"
docker save web:latest | ssh -C "$ssh_configuration" docker load

ssh "$ssh_configuration" 'docker compose -f deploy/docker-compose-manual.yaml up -d web'