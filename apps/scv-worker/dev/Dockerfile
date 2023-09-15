FROM node:18 as base
WORKDIR /usr/src/app
EXPOSE 3001

FROM base as prod
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build scv-worker
ENV NODE_ENV=production
CMD [ "node", "dist/apps/scv-gateway/main.js" ]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon
CMD ["node", "apps/scv-worker/dev/docker-entry.dev.js"]
