FROM node:24-bookworm

RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg && \
    pip3 install --break-system-packages -U yt-dlp && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=10000

EXPOSE 10000

CMD ["node", "bot.js"]