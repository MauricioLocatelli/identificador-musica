require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');

const app = express();
const port = 3000;
const upload = multer();

app.use(express.static('public'));

app.post('/identify', upload.single('audio'), async (req, res) => {
    try {
        const audio = req.file.buffer.toString('base64');

        const response = await axios.post('https://api.audd.io/', {
            api_token: process.env.API_KEY,
            audio: audio,
            return: 'timecode,apple_music,spotify'
        });

        res.json(response.data.result || { error: 'Música não encontrada' });
    } catch (error) {
        console.error('Erro ao identificar a música:', error);
        res.status(500).json({ error: 'Falha na identificação' });
    }
});

app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
