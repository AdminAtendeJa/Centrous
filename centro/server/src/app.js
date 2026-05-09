const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: process.env.ALLOWED_ORIGIN || '*', methods: ['GET', 'POST'] }
});

const supabase = require('./config/supabase');

// Guardar io en app para acceder desde las rutas (req.app.get('io'))
app.set('io', io);

// Middleware para autenticar sockets
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error: No token provided'));

        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return next(new Error('Authentication error: Invalid token'));

        socket.user = user;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log(`🔌 App cliente conectada vía WebSocket: ${socket.id} (User: ${socket.user.id})`);
    socket.join(`user:${socket.user.id}`);
    socket.on('disconnect', () => console.log(`❌ Cliente WS desconectado: ${socket.id}`));
});

// ── Middleware Global ────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// ── Static Files (Frontend Assets) ──────────────────────────────────────────
const distPath = path.join(__dirname, '../../client/dist');
app.use(express.static(distPath));

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/notion', require('./routes/notion.routes'));
app.use('/api/n8n', require('./routes/n8n.routes'));
app.use('/api/webhooks', require('./routes/webhooks.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/social', require('./routes/social.routes'));
app.use('/api/integrations', require('./routes/integrations.routes'));
app.use('/api/crm', require('./routes/crm.routes'));
app.use('/api/tasks', require('./routes/tasks.routes'));

// ── 404 para la API ──────────────────────────────────────────────────────────
app.use('/api', (req, res) => {
    res.status(404).json({ error: true, message: 'Ruta API no encontrada' });
});

// ── React Router Fallback (Debe ser la última ruta GET) ───────────────────────
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.url.startsWith('/api')) {
        return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
});

// ── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('💥 Error no manejado:', err);
    res.status(err.status || 500).json({
        error: true,
        message: err.message || 'Error interno del servidor',
    });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`✅ Centro Backend corriendo en http://localhost:${PORT}`);
    console.log(`📂 Sirviendo frontend desde: ${distPath}`);
});

module.exports = app;
