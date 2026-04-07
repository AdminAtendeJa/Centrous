const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/groq', async (req, res, next) => {
    // Recibe instrucciones y contexto en el BODY
    const { systemPrompt, businessContext } = req.body;

    // Configuración customizada desde el cliente
    const apiKey = req.headers['x-ai-key'];
    const baseUrl = req.headers['x-ai-url'] || 'https://api.groq.com/openai/v1';
    const model = req.headers['x-ai-model'] || 'llama3-70b-8192';

    if (!apiKey) {
        return res.status(401).json({ error: true, message: 'La API Key de la IA no está configurada.' });
    }

    try {
        const payload = {
            model: model,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Aquí está la base de datos de mi sistema Centro Pro en estado RAW.\n\n${JSON.stringify(businessContext, null, 2)}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2
        };

        const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;

        const response = await axios.post(endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const rawContent = response.data.choices[0].message.content;

        // Al forzar "json_object", rawContent DEBE ser string JSON válido.
        const structuredData = JSON.parse(rawContent);

        res.json({ success: true, data: structuredData });

    } catch (err) {
        console.error('[GROQ ERROR]', err.response?.data || err.message);
        next({ status: err.response?.status || 500, message: err.response?.data?.error?.message || err.message });
    }
});

module.exports = router;
