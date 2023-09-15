# Smart Contract Verifier Service

## How to build and run production build

```
docker build . --target prod -t scv-gateway -f apps/scv-gateway/dev/Dockerfile 
docker run -p 3000:3000 scv-gateway       
```

## How to run development environment
```
docker compose up
```
