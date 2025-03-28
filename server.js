import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const LLUVIA_FILE = path.join(__dirname, 'lluvia.json');
const HISTORIAL_FILE = path.join(__dirname, 'historial-lluvia.json');

app.use(express.json());
app.use(express.static('public'));

app.get('/lluvia', (req, res) => {
  fs.readFile(LLUVIA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error leyendo datos' });
    res.json(JSON.parse(data));
  });
});

app.get('/historial-lluvia', (req, res) => {
  fs.readFile(HISTORIAL_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error leyendo historial' });
    res.json(JSON.parse(data));
  });
});

app.post('/guardar-lluvia', (req, res) => {
  const { fecha, lluvia_mm } = req.body;
  if (!fecha || typeof lluvia_mm !== 'number') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  fs.writeFile(LLUVIA_FILE, JSON.stringify({ fecha, lluvia_mm }, null, 2), err => {
    if (err) console.error("Error guardando última lluvia:", err);
  });

  const [year, month] = fecha.split('-');
  const mesClave = `${year}-${month}`;

  fs.readFile(HISTORIAL_FILE, 'utf8', (err, data) => {
    let historial = {};
    if (!err && data) {
      try {
        historial = JSON.parse(data);
      } catch (e) {}
    }

    if (!historial[mesClave]) historial[mesClave] = 0;
    historial[mesClave] += lluvia_mm;
    historial[mesClave] = Math.round(historial[mesClave] * 100) / 100;

    fs.writeFile(HISTORIAL_FILE, JSON.stringify(historial, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error al guardar historial mensual' });
      res.json({ mensaje: `Lluvia guardada para ${mesClave}` });
    });
  });
});

app.listen(PORT, () => {
  console.log(`🌧️ Servidor de lluvia activo en http://localhost:${PORT}`);
});
