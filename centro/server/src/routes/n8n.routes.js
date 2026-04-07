const express = require('express');
const axios = require('axios');
const router = express.Router();

const n8nClient = (customUrl, customKey) =>
    axios.create({
        baseURL: customUrl || process.env.N8N_URL,
        timeout: 10000,
        headers: {
            'X-N8N-API-KEY': customKey || process.env.N8N_API_KEY,
            'Content-Type': 'application/json',
        },
    });

// GET /api/n8n/workflows
router.get('/workflows', async (req, res, next) => {
    const customUrl = req.headers['x-n8n-url'];
    const customKey = req.headers['x-n8n-api-key'];

    if (!(customUrl || process.env.N8N_URL) || !(customKey || process.env.N8N_API_KEY)) {
        return res.status(401).json({ error: true, message: 'N8N_URL o N8N_API_KEY no configuradas' });
    }
    try {
        const response = await n8nClient(customUrl, customKey).get('/api/v1/workflows');
        const workflows = (response.data.data || []).map((wf) => ({
            id: String(wf.id),
            name: wf.name,
            active: wf.active,
            executionCount: wf.executionCount || 0,
            lastExecution: wf.lastExecution || null,
        }));
        res.json(workflows);
    } catch (err) {
        next({ status: err.response?.status || 500, message: err.response?.data?.message || err.message });
    }
});

// PATCH /api/n8n/workflows/:id/toggle
router.patch('/workflows/:id/toggle', async (req, res, next) => {
    const customUrl = req.headers['x-n8n-url'];
    const customKey = req.headers['x-n8n-api-key'];

    if (!(customUrl || process.env.N8N_URL) || !(customKey || process.env.N8N_API_KEY)) {
        return res.status(401).json({ error: true, message: 'n8n no configurado' });
    }
    const { id } = req.params;
    const { active } = req.body;
    try {
        const endpoint = active ? `/api/v1/workflows/${id}/activate` : `/api/v1/workflows/${id}/deactivate`;
        await n8nClient(customUrl, customKey).patch(endpoint);
        res.json({ success: true, id, active });
    } catch (err) {
        next({ status: err.response?.status || 500, message: err.response?.data?.message || err.message });
    }
});

module.exports = router;
