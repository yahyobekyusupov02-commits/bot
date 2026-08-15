require("dotenv").config();

const { Telegraf, Markup } = require("telegraf");
const { execFile } = require("child_process");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");

// ==================================================
// RENDER WEB SERVER
// ==================================================

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("🎵 MUSIQA TOP BOT ISHLAYAPTI 🚀");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(
        `🌐 Web server ${PORT} portda ishga tushdi`
    );
});

// ==================================================
// BOT
// ==================================================

const bot = new Telegraf(process.env.BOT_TOKEN);

// ==================================================
// ADMIN
// ==================================================

const ADMIN_ID = 8460516480;

// ==================================================
// SOZLAMALAR
// ==================================================

const YOUTUBE_BROWSER = "chromium";

// ==================================================
// REQUEST DATABASE
// ==================================================

const REQUEST_FILE = path.join(
    __dirname,
    "requests.json"
);

// ==================================================
// USER DATABASE
// ==================================================

const USER_FILE = path.join(
    __dirname,
    "users.json"
);

// ==================================================
// USERLARNI YUKLASH
// ==================================================

function loadUsers() {
    try {
        if (!fs.existsSync(USER_FILE)) {
            fs.writeFileSync(
                USER_FILE,
                "[]",
                "utf8"
            );

            return [];
        }

        const data = fs.readFileSync(
            USER_FILE,
            "utf8"
        );

        return JSON.parse(data || "[]");

    } catch (error) {
        console.log(
            "⚠️ USER LOAD ERROR:",
            error.message
        );

        return [];
    }
}

// ==================================================
// USERLARNI SAQLASH
// ==================================================

function saveUsers(data) {
    try {
        fs.writeFileSync(
            USER_FILE,
            JSON.stringify(
                data,
                null,
                2
            ),
            "utf8"
        );

    } catch (error) {
        console.log(
            "❌ USER SAVE ERROR:",
            error.message
        );
    }
}

// ==================================================
// USERS
// ==================================================

let users = loadUsers();

// ==================================================
// USER QO‘SHISH
// ==================================================

function addUser(userId) {

    if (!users.includes(userId)) {

        users.push(userId);

        saveUsers(users);

        console.log(
            "👤 Yangi foydalanuvchi:",
            userId
        );

        console.log(
            "👥 Jami foydalanuvchilar:",
            users.length
        );
    }
}

// ==================================================
// REQUESTLARNI YUKLASH
// ==================================================

function loadRequests() {
    try {

        if (!fs.existsSync(REQUEST_FILE)) {

            fs.writeFileSync(
                REQUEST_FILE,
                "{}",
                "utf8"
            );

            return {};
        }

        const data =
            fs.readFileSync(
                REQUEST_FILE,
                "utf8"
            );

        return JSON.parse(
            data || "{}"
        );

    } catch (error) {

        console.log(
            "⚠️ REQUEST LOAD ERROR:",
            error.message
        );

        return {};
    }
}

// ==================================================
// REQUESTLARNI SAQLASH
// ==================================================

function saveRequests(data) {
    try {

        fs.writeFileSync(
            REQUEST_FILE,
            JSON.stringify(
                data,
                null,
                2
            ),
            "utf8"
        );

    } catch (error) {

        console.log(
            "❌ REQUEST SAVE ERROR:",
            error.message
        );
    }
}

// ==================================================
// REQUESTS
// ==================================================

let requests = loadRequests();

// ==================================================
// REQUEST QO‘SHISH
// ==================================================

function addRequest(id, data) {

    requests[id] = data;

    saveRequests(
        requests
    );
}

// ==================================================
// REQUEST OLISH
// ==================================================

function getRequest(id) {

    return requests[id];
}

// ==================================================
// REQUEST O‘CHIRISH
// ==================================================

function deleteRequest(id) {

    delete requests[id];

    saveRequests(
        requests
    );
}

// ==================================================
// REQUEST ID
// ==================================================

function createRequestId() {

    return crypto
        .randomBytes(8)
        .toString("hex");
}

// ==================================================
// INSTAGRAM LINK
// ==================================================

function isInstagramLink(text) {

    return /^https?:\/\/(www\.)?instagram\.com\/(reel|p)\//i.test(
        text
    );
}

// ==================================================
// YOUTUBE LINK
// ==================================================

function isYouTubeLink(text) {

    return (
        /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/i.test(text) ||
        /^https?:\/\/(www\.)?youtube\.com\/shorts\//i.test(text) ||
        /^https?:\/\/youtu\.be\//i.test(text)
    );
}

// ==================================================
// YT-DLP
// ==================================================

function runYtDlp(args) {

    return new Promise(
        (resolve, reject) => {

            console.log(
                "🚀 yt-dlp ishga tushmoqda..."
            );

            console.log(
                args.join(" ")
            );

            execFile(
                "yt-dlp",
                args,
                {
                    maxBuffer:
                        200 * 1024 * 1024
                },
                (
                    error,
                    stdout,
                    stderr
                ) => {

                    if (stdout) {

                        console.log(
                            stdout
                        );
                    }

                    if (stderr) {

                        console.log(
                            stderr
                        );
                    }

                    if (error) {

                        reject(
                            new Error(
                                stderr ||
                                error.message
                            )
                        );

                        return;
                    }

                    resolve();
                }
            );
        }
    );
}

// ==================================================
// FILE DELETE
// ==================================================

function deleteFile(file) {

    try {

        if (
            fs.existsSync(file)
        ) {

            fs.unlinkSync(file);

            console.log(
                "🗑 Deleted:",
                file
            );
        }

    } catch (error) {

        console.log(
            "⚠️ FILE DELETE ERROR:",
            error.message
        );
    }
}

// ==================================================
// ADMIN STATS
// ==================================================

bot.command(
    "stats",
    async (ctx) => {

        if (
            ctx.from.id !== ADMIN_ID
        ) {

            await ctx.reply(
                "❌ Sizda ruxsat yo‘q."
            );

            return;
        }

        const totalUsers =
            users.length;

        await ctx.reply(
            "📊 BOT STATISTIKASI\n\n" +
            `👥 Jami foydalanuvchilar: ${totalUsers}\n\n` +
            `🆔 Admin ID: ${ADMIN_ID}\n` +
            "🚀 Bot ishlayapti!"
        );
    }
);

// ==================================================
// START
// ==================================================

bot.start(
    async (ctx) => {

        console.log(
            "📩 /start:",
            ctx.from.id
        );

        addUser(
            ctx.from.id
        );

        await ctx.reply(
            "🎵 Assalomu alaykum!\n\n" +
            "📸 Instagram — Audio yoki Video\n" +
            "▶️ YouTube — Audio yoki Video\n\n" +
            "Linkni yuboring 🚀"
        );
    }
);

// ==================================================
// LINK QABUL QILISH
// ==================================================

bot.on(
    "text",
    async (ctx) => {

        addUser(
            ctx.from.id
        );

        const text =
            ctx.message.text.trim();

        console.log(
            "📩 TEXT:",
            text
        );

        if (
            text.startsWith("/")
        ) {

            return;
        }

        // ==================================================
        // INSTAGRAM
        // ==================================================

        if (
            isInstagramLink(text)
        ) {

            const requestId =
                createRequestId();

            addRequest(
                requestId,
                {
                    url: text,
                    type: "instagram",
                    userId: ctx.from.id,
                    chatId: ctx.chat.id,
                    createdAt: Date.now()
                }
            );

            console.log(
                "📸 Instagram request:",
                requestId
            );

            await ctx.reply(
                "📸 Instagram link qabul qilindi!\n\n" +
                "Qaysi format kerak?",
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback(
                            "🎵 Audio",
                            `audio:${requestId}`
                        ),

                        Markup.button.callback(
                            "🎬 Video",
                            `video:${requestId}`
                        )
                    ]
                ])
            );

            return;
        }

        // ==================================================
        // YOUTUBE
        // ==================================================

        if (
            isYouTubeLink(text)
        ) {

            const requestId =
                createRequestId();

            addRequest(
                requestId,
                {
                    url: text,
                    type: "youtube",
                    userId: ctx.from.id,
                    chatId: ctx.chat.id,
                    createdAt: Date.now()
                }
            );

            console.log(
                "▶️ YouTube request:",
                requestId
            );

            await ctx.reply(
                "▶️ YouTube link qabul qilindi!\n\n" +
                "Qaysi format kerak?",
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback(
                            "🎵 Audio",
                            `audio:${requestId}`
                        ),

                        Markup.button.callback(
                            "🎬 Video",
                            `video:${requestId}`
                        )
                    ]
                ])
            );

            return;
        }

        // ==================================================
        // NOT SUPPORTED
        // ==================================================

        await ctx.reply(
            "❌ Bu link qo‘llab-quvvatlanmaydi.\n\n" +
            "📸 Instagram Reel link\n" +
            "▶️ YouTube link yuboring."
        );
    }
);

// ==================================================
// AUDIO
// ==================================================

bot.action(
    /^audio:(.+)$/,
    async (ctx) => {

        const requestId =
            ctx.match[1];

        console.log(
            "🎵 AUDIO BUTTON:",
            requestId
        );

        const data =
            getRequest(requestId);

        if (!data) {

            await ctx.answerCbQuery(
                "Bu tugma allaqachon ishlatilgan yoki request topilmadi."
            );

            return;
        }

        deleteRequest(
            requestId
        );

        await ctx.answerCbQuery(
            "Audio yuklash boshlandi 🎵"
        );

        try {

            await ctx.editMessageReplyMarkup(
                {
                    inline_keyboard: []
                }
            );

        } catch (error) {

            console.log(
                "⚠️ KEYBOARD ERROR:",
                error.message
            );
        }

        const id =
            `${data.userId}_${Date.now()}`;

        const output =
            path.join(
                __dirname,
                `audio_${id}.%(ext)s`
            );

        const mp3 =
            path.join(
                __dirname,
                `audio_${id}.mp3`
            );

        try {

            await ctx.reply(
                "⏳ Audio yuklanmoqda... 🎵"
            );

            console.log(
                "================================="
            );

            console.log(
                "🎵 AUDIO DOWNLOAD"
            );

            console.log(
                "👤 USER:",
                data.userId
            );

            console.log(
                "📱 TYPE:",
                data.type
            );

            console.log(
                "🔗 URL:",
                data.url
            );

            console.log(
                "================================="
            );

            const args = [
                "--no-playlist",
                "--no-warnings",
                "-x",
                "--audio-format",
                "mp3",
                "--audio-quality",
                "128K",
                "-o",
                output
            ];

            if (
                data.type === "youtube"
            ) {

                args.unshift(
                    "--cookies-from-browser",
                    YOUTUBE_BROWSER
                );
            }

            args.push(
                data.url
            );

            await runYtDlp(
                args
            );

            if (
                !fs.existsSync(mp3)
            ) {

                throw new Error(
                    "MP3 fayl yaratilmadi."
                );
            }

            const size =
                fs.statSync(mp3).size;

            console.log(
                "📦 MP3 SIZE:",
                size,
                "bytes"
            );

            if (
                size <= 0
            ) {

                throw new Error(
                    "MP3 fayl bo‘sh."
                );
            }

            await ctx.reply(
                "📤 Audio Telegramga yuborilmoqda..."
            );

            const form =
                new FormData();

            form.append(
                "chat_id",
                String(data.chatId)
            );

            form.append(
                "audio",
                fs.createReadStream(mp3)
            );

            const telegramUrl =
                `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendAudio`;

            const response =
                await axios.post(
                    telegramUrl,
                    form,
                    {
                        headers: {
                            ...form.getHeaders()
                        },

                        maxContentLength:
                            Infinity,

                        maxBodyLength:
                            Infinity,

                        timeout:
                            180000
                    }
                );

            console.log(
                "📨 TELEGRAM:",
                response.data
            );

            if (
                !response.data.ok
            ) {

                throw new Error(
                    JSON.stringify(
                        response.data
                    )
                );
            }

            console.log(
                "✅ AUDIO YUBORILDI"
            );

        } catch (error) {

            console.log(
                "❌ AUDIO ERROR:"
            );

            console.log(
                error.message
            );

            await ctx.reply(
                "❌ Audio yuklab bo‘lmadi.\n\n" +
                "Sabab: " +
                error.message.substring(
                    0,
                    500
                )
            );

        } finally {

            deleteFile(
                mp3
            );

            try {

                const files =
                    fs.readdirSync(
                        __dirname
                    );

                for (
                    const file of files
                ) {

                    if (
                        file.startsWith(
                            `audio_${id}`
                        )
                    ) {

                        deleteFile(
                            path.join(
                                __dirname,
                                file
                            )
                        );
                    }
                }

            } catch (error) {

                console.log(
                    "⚠️ CLEAN ERROR:",
                    error.message
                );
            }
        }
    }
);

// ==================================================
// VIDEO
// ==================================================

bot.action(
    /^video:(.+)$/,
    async (ctx) => {

        const requestId =
            ctx.match[1];

        console.log(
            "🎬 VIDEO BUTTON:",
            requestId
        );

        const data =
            getRequest(requestId);

        if (!data) {

            await ctx.answerCbQuery(
                "Bu tugma allaqachon ishlatilgan yoki request topilmadi."
            );

            return;
        }

        deleteRequest(
            requestId
        );

        await ctx.answerCbQuery(
            "Video yuklash boshlandi 🎬"
        );

        try {

            await ctx.editMessageReplyMarkup(
                {
                    inline_keyboard: []
                }
            );

        } catch (error) {

            console.log(
                "⚠️ KEYBOARD ERROR:",
                error.message
            );
        }

        const id =
            `${data.userId}_${Date.now()}`;

        const output =
            path.join(
                __dirname,
                `video_${id}.%(ext)s`
            );

        const mp4 =
            path.join(
                __dirname,
                `video_${id}.mp4`
            );

        try {

            await ctx.reply(
                "⏳ Video yuklanmoqda... 🎬"
            );

            console.log(
                "================================="
            );

            console.log(
                "🎬 VIDEO DOWNLOAD"
            );

            console.log(
                "👤 USER:",
                data.userId
            );

            console.log(
                "📱 TYPE:",
                data.type
            );

            console.log(
                "🔗 URL:",
                data.url
            );

            console.log(
                "================================="
            );

            const args = [
                "--no-playlist",
                "--no-warnings",
                "-f",
                "bestvideo+bestaudio/best",
                "--merge-output-format",
                "mp4",
                "-o",
                output
            ];

            if (
                data.type === "youtube"
            ) {

                args.unshift(
                    "--cookies-from-browser",
                    YOUTUBE_BROWSER
                );
            }

            args.push(
                data.url
            );

            await runYtDlp(
                args
            );

            if (
                !fs.existsSync(mp4)
            ) {

                throw new Error(
                    "MP4 fayl yaratilmadi."
                );
            }

            const size =
                fs.statSync(mp4).size;

            console.log(
                "📦 MP4 SIZE:",
                size,
                "bytes"
            );

            if (
                size <= 0
            ) {

                throw new Error(
                    "MP4 fayl bo‘sh."
                );
            }

            await ctx.reply(
                "📤 Video Telegramga yuborilmoqda..."
            );

            const form =
                new FormData();

            form.append(
                "chat_id",
                String(data.chatId)
            );

            form.append(
                "video",
                fs.createReadStream(mp4)
            );

            const telegramUrl =
                `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendVideo`;

            const response =
                await axios.post(
                    telegramUrl,
                    form,
                    {
                        headers: {
                            ...form.getHeaders()
                        },

                        maxContentLength:
                            Infinity,

                        maxBodyLength:
                            Infinity,

                        timeout:
                            180000
                    }
                );

            console.log(
                "📨 TELEGRAM:",
                response.data
            );

            if (
                !response.data.ok
            ) {

                throw new Error(
                    JSON.stringify(
                        response.data
                    )
                );
            }

            console.log(
                "✅ VIDEO YUBORILDI"
            );

        } catch (error) {

            console.log(
                "❌ VIDEO ERROR:"
            );

            console.log(
                error.message
            );

            await ctx.reply(
                "❌ Video yuklab bo‘lmadi.\n\n" +
                "Sabab: " +
                error.message.substring(
                    0,
                    500
                )
            );

        } finally {

            deleteFile(
                mp4
            );

            try {

                const files =
                    fs.readdirSync(
                        __dirname
                    );

                for (
                    const file of files
                ) {

                    if (
                        file.startsWith(
                            `video_${id}`
                        )
                    ) {

                        deleteFile(
                            path.join(
                                __dirname,
                                file
                            )
                        );
                    }
                }

            } catch (error) {

                console.log(
                    "⚠️ CLEAN ERROR:",
                    error.message
                );
            }
        }
    }
);

// ==================================================
// BOT ERROR
// ==================================================

bot.catch(
    (error) => {

        console.log(
            "❌ BOT ERROR:"
        );

        console.log(
            error
        );
    }
);

// ==================================================
// BOT START
// ==================================================

bot.launch()
    .then(() => {

        console.log(
            "================================="
        );

        console.log(
            "🎵 MUSIQA TOP BOT ISHGA TUSHDI 🚀"
        );

        console.log(
            "📸 Instagram: Audio + Video"
        );

        console.log(
            "▶️ YouTube: Audio + Video"
        );

        console.log(
            "👥 Users:",
            users.length
        );

        console.log(
            "💾 Requests: requests.json"
        );

        console.log(
            "💾 Users: users.json"
        );

        console.log(
            "================================="
        );

    })
    .catch(
        (error) => {

            console.log(
                "❌ LAUNCH ERROR:"
            );

            console.log(
                error
            );
        }
    );

// ==================================================
// STOP
// ==================================================

process.once(
    "SIGINT",
    () => {

        bot.stop("SIGINT");

        server.close();
    }
);

process.once(
    "SIGTERM",
    () => {

        bot.stop("SIGTERM");

        server.close();
    }
);