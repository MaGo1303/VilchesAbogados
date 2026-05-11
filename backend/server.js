const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDatabase, getDb } = require('./database');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'lexcorp_secret_key_2026';

app.use(cors());
app.use(express.json());
app.use(express.static('../'));

let db;
try {
  db = initDatabase();
} catch (err) {
  console.error('Error al inicializar la base de datos:', err);
  process.exit(1);
}

const SLOTS = [
  '09:00', '09:45', '10:30', '11:15',
  '12:00', '14:00', '14:45', '15:30',
  '16:15', '17:00', '17:45',
];

function getAvailableSlots(abogadoId, fecha) {
  const ocupados = db.prepare(
    'SELECT horario FROM citas WHERE abogado_id = ? AND fecha = ?'
  ).all(abogadoId, fecha).map(r => r.horario);
  return SLOTS.filter(s => !ocupados.includes(s));
}

// Auth middleware
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
}

// ==================== AUTH ====================

app.post('/api/register', (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  const existing = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ success: false, error: 'El email ya está registrado' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)').run(nombre, email, hash);
  const token = jwt.sign({ id: result.lastInsertRowid, nombre, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: result.lastInsertRowid, nombre, email, role: 'user' } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });
  }
  const user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ id: user.id, nombre: user.nombre, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role } });
});

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ==================== ABOGADOS ====================

app.get('/api/abogados', (req, res) => {
  const abogados = db.prepare('SELECT id, nombre, especialidad FROM abogados').all();
  res.json({ abogados });
});

// ==================== HORARIOS ====================

app.get('/api/horarios/:abogadoId/:fecha', (req, res) => {
  const { abogadoId, fecha } = req.params;

  const abogado = db.prepare('SELECT id FROM abogados WHERE id = ?').get(abogadoId);
  if (!abogado) {
    return res.status(404).json({ error: 'Abogado no encontrado' });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(fecha)) {
    return res.status(400).json({ error: 'Formato de fecha inválido (YYYY-MM-DD)' });
  }

  const inputDate = new Date(fecha + 'T12:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    return res.json({ slots: [], message: 'No se puede agendar en el pasado' });
  }

  const day = inputDate.getDay();
  if (day === 0) {
    return res.json({ slots: [], message: 'Domingo no laborable' });
  }

  let availableSlots = getAvailableSlots(parseInt(abogadoId), fecha);

  if (day === 6) {
    availableSlots = availableSlots.filter(s => {
      const hour = parseInt(s.split(':')[0], 10);
      return hour < 13;
    });
  }

  res.json({ slots: availableSlots });
});

// ==================== CITAS ====================

app.post('/api/citas', (req, res) => {
  const { abogadoId, fecha, horario, nombre, email, telefono, area, descripcion } = req.body;

  if (!abogadoId || !fecha || !horario || !nombre || !email || !area) {
    return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
  }

  const abogado = db.prepare('SELECT id FROM abogados WHERE id = ?').get(abogadoId);
  if (!abogado) {
    return res.status(404).json({ success: false, error: 'Abogado no encontrado' });
  }

  if (!SLOTS.includes(horario)) {
    return res.status(400).json({ success: false, error: 'Horario no válido' });
  }

  const inputDate = new Date(fecha + 'T12:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (inputDate < today) {
    return res.status(400).json({ success: false, error: 'No se puede agendar en el pasado' });
  }

  // If user is logged in, link the appointment to their account
  let usuarioId = null;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
      usuarioId = decoded.id;
    } catch {}
  }

  try {
    const insert = db.prepare(`
      INSERT INTO citas (usuario_id, abogado_id, fecha, horario, nombre, email, telefono, area, descripcion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(usuarioId, abogadoId, fecha, horario, nombre, email, telefono || null, area, descripcion || null);

    res.json({ success: true, message: 'Cita agendada correctamente' });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ success: false, error: 'Este horario ya está reservado' });
    }
    console.error('Error al crear cita:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Mis citas (usuario autenticado)
app.get('/api/mis-citas', authMiddleware, (req, res) => {
  const citas = db.prepare(`
    SELECT c.id, a.nombre as abogado, a.especialidad, c.fecha, c.horario, c.nombre as cliente, c.email, c.area, c.descripcion, c.creada_en
    FROM citas c
    JOIN abogados a ON a.id = c.abogado_id
    WHERE c.usuario_id = ?
    ORDER BY c.fecha DESC, c.horario DESC
  `).all(req.user.id);
  res.json({ citas });
});

// Admin: todas las citas
app.get('/api/admin/citas', authMiddleware, adminMiddleware, (req, res) => {
  const citas = db.prepare(`
    SELECT c.id, u.nombre as usuario, u.email as usuario_email, a.nombre as abogado, a.especialidad, c.fecha, c.horario, c.nombre as cliente, c.email, c.telefono, c.area, c.descripcion, c.creada_en
    FROM citas c
    JOIN abogados a ON a.id = c.abogado_id
    LEFT JOIN usuarios u ON u.id = c.usuario_id
    ORDER BY c.creada_en DESC
  `).all();
  res.json({ citas });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const totalAbogados = db.prepare('SELECT COUNT(*) as count FROM abogados').get().count;
  const totalCitas = db.prepare('SELECT COUNT(*) as count FROM citas').get().count;
  const totalUsuarios = db.prepare('SELECT COUNT(*) as count FROM usuarios').get().count;
  const citasHoy = db.prepare("SELECT COUNT(*) as count FROM citas WHERE fecha = date('now')").get().count;
  res.json({ totalAbogados, totalCitas, totalUsuarios, citasHoy });
});

app.listen(PORT, () => {
   console.log(`Vilches Abogados API corriendo en http://localhost:${PORT}`);
});