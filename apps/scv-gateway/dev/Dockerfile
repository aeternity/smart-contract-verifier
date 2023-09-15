FROM node:18 as base
WORKDIR /usr/src/app
EXPOSE 3000

FROM base as prod
ENV NODE_ENV=production
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build scv-gateway
CMD [ "node", "dist/apps/scv-gateway/main.js" ]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon
CMD ["node", "apps/scv-gateway/dev/docker-entry.dev.js"]
