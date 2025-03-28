const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FILE_PATH = path.join(__dirname, 'lluvia.json');

app.use(cors());
app.use(express.json());

app.post('/guardar-lluvia', (req, res) => {
  const { year, month, total } = req.body;
  if (!year || !month || typeof total !== 'number') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  let data = {};

  // Leer archivo con manejo de errores
  try {
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH);
      data = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error leyendo archivo:', err);
    return res.status(500).json({ error: 'No se pudo leer el archivo' });
  }

  // Guardar los nuevos datos
  data[`${year}-${month}`] = total;

  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
    res.json({ message: 'Lluvia guardada correctamente' });
  } catch (err) {
    console.error('Error escribiendo archivo:', err);
    res.status(500).json({ error: 'No se pudo guardar el archivo' });
  }
});



app.get('/lluvia', (req, res) => {
  if (!fs.existsSync(FILE_PATH)) return res.json({});
  const data = JSON.parse(fs.readFileSync(FILE_PATH));
  res.json(data);
});

// ✅ Página visual en la raíz
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Servidor de lluvia</title>
        <style>
          body {
            background-color: #1e293b;
            color: white;
            font-family: sans-serif;
            padding: 2rem;
            text-align: center;
          }
          code {
            background: #334155;
            padding: 0.2rem 0.4rem;
            border-radius: 5px;
          }
          a {
            color: #38bdf8;
            text-decoration: underline;
            font-weight: bold;
            display: inline-block;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <h1>🌧️ Servidor de lluvia activo</h1>
        <p>Consulta datos en <code>/lluvia</code></p>
        <p>Envía datos con <code>POST /guardar-lluvia</code></p>
        <a href="https://estacion-meteoalfa.onrender.com" target="_blank">🌐 Ver la interfaz meteorológica</a>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ Backend activo en http://localhost:${PORT}`);
});
