FROM node:16.20.1-alpine

WORKDIR /app
COPY package.json pnpm-lock.yaml ./

RUN wget -O- https://get.pnpm.io/v6.14.js | node - add --global pnpm@6
RUN pnpm install
COPY . .
RUN pnpm run build
ENV PORT 3000

CMD ["npm", "run", "start:dev"]
