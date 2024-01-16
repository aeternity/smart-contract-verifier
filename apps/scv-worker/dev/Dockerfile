FROM node:18 as base
WORKDIR /usr/src/app
EXPOSE 3001

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install --no-install-recommends elixir erlang-syntax-tools git
RUN apt-get -y clean
RUN rm -rf /var/lib/apt/lists/*
RUN git clone --depth 1 --branch v7.4.0 https://github.com/aeternity/aesophia_cli.git /usr/src/aesophia_cli
RUN mkdir -p /usr/src/aesophia_cli/contract


FROM base as prod
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build scv-worker
ENV NODE_ENV=production
CMD [ "node", "dist/apps/scv-worker/main.js" ]


FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon
CMD ["node", "apps/scv-worker/dev/docker-entry.dev.js"]
