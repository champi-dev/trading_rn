# Trading RN API (Express + better-sqlite3)
FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY public ./public
# SQLite database lives in /app/data (mounted as a volume)
RUN mkdir -p data
EXPOSE 3000
CMD ["node", "src/index.js"]
