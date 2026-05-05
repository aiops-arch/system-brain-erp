FROM node:22-bookworm-slim AS app

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=5175

EXPOSE 5175

CMD ["sh", "-c", "npm run dev"]
