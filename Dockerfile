FROM node:slim

WORKDIR /project
COPY . .
RUN corepack enable
RUN pnpm install

WORKDIR /project/Backend
RUN pnpm prisma generate

CMD ["pnpm","run","start"]