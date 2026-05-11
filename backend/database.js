const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'lexcorp.db');

let db;

function initDatabase() {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS abogados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      especialidad TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      creada_en TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS citas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      abogado_id INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      horario TEXT NOT NULL,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      telefono TEXT,
      area TEXT NOT NULL,
      descripcion TEXT,
      creada_en TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (abogado_id) REFERENCES abogados(id)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_citas_unica
      ON citas(abogado_id, fecha, horario);
  `);

  const count = db.prepare('SELECT COUNT(*) as total FROM abogados').get();
  if (count.total === 0) {
    const insertAbogado = db.prepare('INSERT INTO abogados (nombre, especialidad) VALUES (?, ?)');
    insertAbogado.run('Dr. Ricardo González', 'Corporativo & Tributario');
    insertAbogado.run('Dra. Luciana Vargas', 'Laboral & Migratorio');
    console.log('Abogados de prueba insertados.');
  }

  const adminCount = db.prepare("SELECT COUNT(*) as total FROM usuarios WHERE email = 'admin@lexcorp.com'").get();
  if (adminCount.total === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO usuarios (nombre, email, password, role) VALUES (?, ?, ?, ?)').run('Admin', 'admin@lexcorp.com', hash, 'admin');
    console.log('Usuario admin creado (admin@lexcorp.com / admin123).');
  }

  console.log('Base de datos inicializada correctamente.');
  return db;
}

function getDb() {
  if (!db) throw new Error('Base de datos no inicializada');
  return db;
}

module.exports = { initDatabase, getDb };
