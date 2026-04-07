const express = require('express');
const axios = require('axios');
const router = express.Router();

const NOTION_KEY = () => process.env.NOTION_API_KEY;
const NOTION_VERSION = '2022-06-28';

const notionClient = (customKey) =>
    axios.create({
        baseURL: 'https://api.notion.com/v1',
        timeout: 10000,
        headers: {
            Authorization: `Bearer ${customKey || NOTION_KEY()}`,
            'Notion-Version': NOTION_VERSION,
            'Content-Type': 'application/json',
        },
    });

// GET /api/notion/pages — search all pages and databases
router.get('/pages', async (req, res, next) => {
    const customKey = req.headers['x-notion-key'];
    if (!(customKey || NOTION_KEY())) {
        return res.status(401).json({ error: true, message: 'NOTION_API_KEY no configurada' });
    }
    try {
        const response = await notionClient(customKey).post('/search', {
            sort: { direction: 'descending', timestamp: 'last_edited_time' },
            page_size: 30,
        });
        const results = response.data.results.map((item) => ({
            id: item.id,
            type: item.object,
            emoji: item.icon?.emoji || null,
            title:
                item.properties?.title?.title?.[0]?.plain_text ||
                item.properties?.Name?.title?.[0]?.plain_text ||
                item.title?.[0]?.plain_text ||
                'Sin título',
            lastEdited: item.last_edited_time,
            url: item.url,
        }));
        res.json(results);
    } catch (err) {
        next({ status: err.response?.status || 500, message: err.response?.data?.message || err.message });
    }
});

// GET /api/notion/pages/:id/blocks — Obtener contenido (bloques) de la página
router.get('/pages/:id/blocks', async (req, res, next) => {
    const customKey = req.headers['x-notion-key'];
    try {
        const response = await notionClient(customKey).get(`/blocks/${req.params.id}/children?page_size=100`);
        res.json(response.data.results || []);
    } catch (err) {
        next({ status: err.response?.status || 500, message: err.response?.data?.message || err.message });
    }
});

// PATCH /api/notion/pages/:id/blocks — Añadir bloque a la página
router.patch('/pages/:id/blocks', async (req, res, next) => {
    const customKey = req.headers['x-notion-key'];
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: true, message: 'Texto requerido' });

    try {
        const payload = {
            children: [{
                object: 'block',
                type: 'paragraph',
                paragraph: { rich_text: [{ type: 'text', text: { content: text } }] }
            }]
        };
        const response = await notionClient(customKey).patch(`/blocks/${req.params.id}/children`, payload);
        res.json(response.data);
    } catch (err) {
        next({ status: err.response?.status || 500, message: err.response?.data?.message || err.message });
    }
});

// PATCH /api/notion/blocks/:id — Editar un bloque (párrafo) existente
router.patch('/blocks/:id', async (req, res, next) => {
    const customKey = req.headers['x-notion-key'];
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: true, message: 'Texto requerido' });

    try {
        const payload = {
            paragraph: { rich_text: [{ type: 'text', text: { content: text } }] }
        };
        const response = await notionClient(customKey).patch(`/blocks/${req.params.id}`, payload);
        res.json(response.data);
    } catch (err) {
        next({ status: err.response?.status || 500, message: err.response?.data?.message || err.message });
    }
});

module.exports = router;
