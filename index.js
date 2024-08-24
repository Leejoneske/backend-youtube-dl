import express from 'express';
import ytdl from 'ytdl-core';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 4000;

const app = express();
app.use(cors());

// Helper function to send error response
function sendErrorResponse(res, message, error) {
    console.error(message, error);
    res.status(500).send(`Failed to download media: ${message}`);
}

// Endpoint to download mp3
app.get('/downloadmp3', async (req, res) => {
    try {
        const url = req.query.url;
        if (!ytdl.validateURL(url)) {
            return sendErrorResponse(res, 'Invalid URL.', new Error('Invalid URL'));
        }
        const info = await ytdl.getInfo(url);
        const audioFormat = ytdl.filterFormats(info.formats, 'audioonly')[0];

        res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
        ytdl(url, { format: audioFormat }).pipe(res);
    } catch (error) {
        sendErrorResponse(res, 'Failed to download audio.', error);
    }
});

// Endpoint to download mp4
app.get('/downloadmp4', async (req, res) => {
    try {
        const url = req.query.url;
        if (!ytdl.validateURL(url)) {
            return sendErrorResponse(res, 'Invalid URL.', new Error('Invalid URL'));
        }
        const info = await ytdl.getInfo(url);
        const videoFormat = ytdl.filterFormats(info.formats, 'videoandaudio')[0];

        res.header('Content-Disposition', 'attachment; filename="video.mp4"');
        ytdl(url, { format: videoFormat }).pipe(res);
    } catch (error) {
        sendErrorResponse(res, 'Failed to download video.', error);
    }
});

// Endpoint to download GIF (placeholder, as ytdl-core does not support GIF creation directly)
app.get('/downloadgif', async (req, res) => {
    res.status(501).send('GIF download is not supported yet.');
});

// Endpoint to download a screenshot (placeholder, as this would require additional logic)
app.get('/downloadpscreen', async (req, res) => {
    res.status(501).send('Screenshot download is not supported yet.');
});

// SSE Ping endpoint (every second)
app.get('/ping-sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const intervalId = setInterval(() => {
        res.write(`data: ${new Date().toISOString()}\n\n`);
    }, 1000);

    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });
});

// Simple ping endpoint for latency testing
app.head('/ping', (req, res) => {
    res.status(200).end();
});

app.listen(port, () => {
    console.log(`Server is running on PORT: ${port}`);
});
