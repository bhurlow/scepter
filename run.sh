#! /bin/bash

docker build -t bhurlow/scepter .

docker run \
  -it \
  --rm \
  --name scepter \
  -v /var/run/docker.sock:/var/run/docker.sock \
   -v /mnt:/mnt \
  bhurlow/scepter

