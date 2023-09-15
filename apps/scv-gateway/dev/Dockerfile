FROM node:18 as base
WORKDIR /usr/src/app
EXPOSE 3000

FROM base as prod
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build scv-gateway
ENV NODE_ENV=production
CMD [ "node", "dist/apps/scv-gateway/main.js" ]

FROM base as dev
RUN npm install -g nodemon
ENV NODE_ENV=development
CMD ["node", "apps/scv-gateway/dev/docker-entry.dev.js"]
