// /api/identify.js
require('dotenv').config();
const multer = require('multer');
const axios = require('axios');
const upload = multer();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Lida com o multipart form
    upload.single('audio')(req, res, async (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao processar o áudio' });

      const audio = req.file.buffer.toString('base64');

      const response = await axios.post('https://api.audd.io/', {
        api_token: process.env.API_KEY,
        audio: audio,
        return: 'timecode,apple_music,spotify'
      });

      res.json(response.data.result || { error: 'Música não encontrada' });
    });
  } catch (error) {
    console.error('Erro ao identificar a música:', error);
    res.status(500).json({ error: 'Falha na identificação' });
  }
};
