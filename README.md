# Smart Contract Verifier Service

## How to build and run production build

```
docker build . --target prod -t scv-gateway -f apps/scv-gateway/dev/Dockerfile 
docker run -p 3000:3000 scv-gateway

# the name of service can be different - in case of error check docker ps to get the correct one
docker exec -it smart-contract-verifier-scv-gateway-1 npm run migration:run
```

## How to run development environment
```
docker compose up
```

