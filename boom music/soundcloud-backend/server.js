const express = require('express');
const cors = require('cors');
const { scdl } = require('soundcloud-downloader');

const app = express();
const PORT = process.env.PORT || 3000;

// Izinkan CORS Penuh agar Web Audio API tidak diblokir browser
app.use(cors({ origin: '*' }));

app.get('/stream', async (req, res) => {
    const scUrl = req.query.url;
    const CLIENT_ID = '2t918tWThqM8y3yAOiT3pLydp8M44O9L'; // Client ID Publik

    if (!scUrl) {
        return res.status(400).send('Parameter url dibutuhkan');
    }

    try {
        // Get Metadata Lagu
        const info = await scdl.getInfo(scUrl, CLIENT_ID);
        
        // Set Header Audio MP3 Statis
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');

        // Stream audio langsung ke client sebagai MP3 murni
        const stream = await scdl.download(scUrl, CLIENT_ID);
        stream.pipe(res);

    } catch (err) {
        console.error('Error streaming SoundCloud:', err.message);
        res.status(500).send('Gagal memproses audio SoundCloud');
    }
});

app.listen(PORT, () => {
    console.log(`Server Backend running on port ${PORT}`);
});
