const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: process.env.ALLOWED_ORIGIN || '*', methods: ['GET', 'POST'] }
});

// Guardar io en app para acceder desde las rutas (req.app.get('io'))
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`🔌 App cliente conectada vía WebSocket: ${socket.id}`);
    socket.on('disconnect', () => console.log(`❌ Cliente WS desconectado: ${socket.id}`));
});

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/notion', require('./routes/notion.routes'));
app.use('/api/n8n', require('./routes/n8n.routes'));
app.use('/api/webhooks', require('./routes/webhooks.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/social', require('./routes/social.routes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message, err.stack);
    res.status(err.status || 500).json({
        error: true,
        message: err.message || 'Error interno del servidor',
        status: err.status || 500,
    });
});

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: true, message: 'Ruta no encontrada' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`✅ Centro Backend corriendo en http://localhost:${PORT}`);
    if (!process.env.NOTION_API_KEY) console.warn('⚠️  NOTION_API_KEY no configurada — mostrando demo');
    if (!process.env.N8N_API_KEY) console.warn('⚠️  N8N_API_KEY no configurada — mostrando demo');
});

module.exports = app;
