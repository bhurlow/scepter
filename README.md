# scepter
quick and dirty docker exception tracker

### usage

```
docker run \
  -d \
  -v /var/run/docker.sock:/var/run/docker.sock \
  bhurlow/scepter
```

### tests

```
npm test
```
