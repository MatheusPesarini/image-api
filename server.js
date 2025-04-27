const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');

const app = express();
const port = 4000;

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/images/home', (req, res) => {
  const homeImagesPath = path.join(__dirname, 'images', 'home');
  try {
    if (!fs.existsSync(homeImagesPath)) {
      console.error("Diretório não encontrado:", homeImagesPath);
      return res.status(404).json({ message: "Diretório de imagens 'home' não encontrado." });
    }

    const files = fs.readdirSync(homeImagesPath);
    const imageUrls = files
      .filter(file => /\.(jpe?g|png|webp)$/i.test(file))
      .map(file => ({
        src: `${req.protocol}://${req.get('host')}/images/HOME/${file}`,
        alt: `Imagem ${file}`
      }));
    res.json(imageUrls);
  } catch (error) {
    console.error("Erro ao ler imagens do carrossel:", error);
    res.status(500).json({ message: "Erro ao buscar imagens." });
  }
});

app.get('/', (req, res) => {
  res.send('Servidor Express de imagens local está funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Imagens estão disponíveis a partir de http://localhost:${port}/images/`);
  console.log(`Exemplo: http://localhost:${port}/images/camisetas/nome_da_imagem.jpg`);
});