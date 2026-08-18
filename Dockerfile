FROM node:24-bookworm

# yt-dlp va ffmpeg o'rnatish
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg && \
    pip3 install --break-system-packages -U yt-dlp && \
    rm -rf /var/lib/apt/lists/*

# Bot papkasi
WORKDIR /app

# Node paketlarini o'rnatish
COPY package*.json ./
RUN npm install

# Bot kodlarini nusxalash
COPY . .

# Railway uchun port
ENV PORT=8080

EXPOSE 8080

# Botni ishga tushirish
CMD ["node", "bot.js"]