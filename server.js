const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');

const app = express();
const port = 4000;

const imagesBaseDir = path.join(__dirname, 'images');
fs.mkdirSync(imagesBaseDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesBaseDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

var corsOptions = {
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use('/images', express.static(imagesBaseDir));

app.post('/upload', upload.single('image'), (req, res) => {
  console.log('Recebida requisição POST /upload');
  if (!req.file) {
    console.error('Nenhum arquivo recebido no campo "image"');
    return res.status(400).json({ message: 'Nenhum arquivo foi enviado no campo "image".' });
  }

  console.log('Arquivo recebido:', req.file.filename);

  const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  console.log('URL da imagem gerada:', imageUrl);

  res.status(201).json({ imageUrl: imageUrl });
});

app.get('/images/home', (req, res) => {
  const homeImagesPath = imagesBaseDir; 
  try {
    if (!fs.existsSync(homeImagesPath)) {
      console.error("Diretório não encontrado:", homeImagesPath);
      return res.status(404).json({ message: "Diretório de imagens não encontrado." });
    }

    const files = fs.readdirSync(homeImagesPath);
    const imageUrls = files
      .filter(file => /\.(jpe?g|png|webp)$/i.test(file)) 
      .map(file => ({
        src: `${req.protocol}://${req.get('host')}/images/${file}`,
        alt: `Imagem ${file}`
      }));
    res.json(imageUrls);
  } catch (error) {
    console.error("Erro ao ler imagens:", error);
    res.status(500).json({ message: "Erro ao buscar imagens." });
  }
});


app.get('/', (req, res) => {
  res.send('Servidor Express de imagens local está funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor de imagens rodando em http://localhost:${port}`);
  console.log(`Imagens servidas de: ${imagesBaseDir}`);
  console.log(`Acessíveis via: http://localhost:${port}/images/`);
});