const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/meta', async (req, res, next) => {
    try {
        const { url, key } = req.body;
        if (!url || !key) {
            return res.status(400).json({ success: false, message: 'URL and Key are required' });
        }

        // Usamos el endpoint REST de Supabase para hacer introspección (limitada) o consultar una tabla dummy
        // Sin embargo, la API de Supabase REST no expone directamente pg_class o pg_tables por seguridad a menos que 
        // hagamos un query RPC o sepamos qué tablas buscar.
        // Dado que este es un "constructor dinámico de dashboards", le pediremos a la base de datos
        // los metadatos usando OpenAPI endpoint si está disponible, o simplemente consultaremos tablas estándar.
        
        // Supabase expone su esquema OpenAPI en /rest/v1/?apikey=...
        const openApiRes = await axios.get(`${url}/rest/v1/`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        const openApiSchema = openApiRes.data;
        const tables = Object.keys(openApiSchema.definitions || {});
        
        // Vamos a extraer muestras de los primeros 10 registros de cada tabla principal para entender su forma
        // Limitamos a 3 tablas máximo por rendimiento
        const tableSamples = {};
        for (const tableName of tables.slice(0, 3)) {
            try {
                const sampleRes = await axios.get(`${url}/rest/v1/${tableName}?select=*&limit=5`, {
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                tableSamples[tableName] = sampleRes.data;
            } catch (e) {
                console.error(`No se pudo leer sample de ${tableName}`, e.message);
            }
        }

        res.json({ 
            success: true, 
            schema: {
                tables: tables,
                definitions: openApiSchema.definitions,
                samples: tableSamples
            }
        });
    } catch (err) {
        console.error('Supabase Meta Error:', err);
        res.status(500).json({ success: false, message: 'Failed to extract database metadata' });
    }
});

module.exports = router;
