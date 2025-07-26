const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/drive/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const apiKey = 'AIzaSyD8zoU0KerJB_4cXBMpjbS_jNkxJnSjgNM';
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error('Erro do Google Drive:', response.status, text);
      return res.status(response.status).send(text);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.set('Content-Type', response.headers.get('content-type'));
    res.send(buffer);
  } catch (err) {
    console.error('Erro no proxy:', err);
    res.status(500).send('Erro ao baixar arquivo');
  }
});

app.listen(3001, () => console.log('Proxy rodando na porta 3001'));