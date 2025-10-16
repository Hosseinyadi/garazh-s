FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production || npm i --omit=dev
COPY . .
RUN mkdir -p uploads
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "server.js"]
