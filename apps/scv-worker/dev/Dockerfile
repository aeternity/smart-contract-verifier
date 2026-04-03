FROM node:18 as base
WORKDIR /usr/src/app
EXPOSE 3001

# Install a pinned OTP version from Erlang Solutions to match what priv/bin escripts were compiled with (OTP-24).
# OTP-24 BEAM bytecode is compatible with OTP-24 through OTP-27+, so OTP-25 is a safe pin.
RUN apt-get -y update && apt-get -y upgrade \
  && apt-get -y install --no-install-recommends curl gnupg \
  && curl -fsSL https://packages.erlang-solutions.com/erlang-solutions_2.0_all.deb -o /tmp/esl.deb \
  && dpkg -i /tmp/esl.deb && rm /tmp/esl.deb \
  && apt-get -y update \
  && apt-get -y install --no-install-recommends esl-erlang=1:25.3.2 \
  && apt-get -y clean && rm -rf /var/lib/apt/lists/*

# Download all pre-built binaries from priv/bin in the aesophia_cli v8.0.0 tag
RUN for ver in 1.4.0 2.0.0 2.1.0 3.0.0 3.1.0 3.2.0 \
  4.0.0 4.1.0 4.2.0 4.3.0 4.3.1 \
  5.0.0 \
  6.0.0 6.0.1 6.0.2 6.1.0 \
  7.0.0 7.0.1 7.1.0 7.2.1 7.3.0 7.4.0 7.4.1 \
  8.0.0; do \
  mkdir -p /usr/src/compilers/$ver && \
  curl -fsSL \
  https://raw.githubusercontent.com/aeternity/aesophia_cli/v8.0.0/priv/bin/v${ver}/aesophia_cli \
  -o /usr/src/compilers/$ver/aesophia_cli && \
  chmod +x /usr/src/compilers/$ver/aesophia_cli; \
  done

# v8.0.1 - no official CLI release; aesophia v8.0.1 only fixes a C warning with identical bytecode output
# reuse the v8.0.0 binary
RUN mkdir -p /usr/src/compilers/8.0.1 \
  && cp /usr/src/compilers/8.0.0/aesophia_cli /usr/src/compilers/8.0.1/aesophia_cli

RUN mkdir -p /usr/src/contracts


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
