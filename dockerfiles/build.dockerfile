FROM node:lts-slim AS builder

# Upgrade system packages to address vulnerabilities
# RUN apt-get update

WORKDIR /nodeApp
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn install --frozen-lockfile; 

COPY . .
RUN yarn build

ENV NODE_ENV=production
RUN yarn install --frozen-lockfile --production=true; 

FROM node:lts-alpine

WORKDIR /nodeApp
COPY --from=builder /nodeApp/node_modules ./node_modules
COPY --from=builder /nodeApp/build ./bin
COPY --from=builder /nodeApp/.env.local ./.env.local

ENV PORT=5000
EXPOSE 5000

CMD ["node", "./bin/server.js"]


