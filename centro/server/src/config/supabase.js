const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ [Server] Configuración de Supabase incompleta en .env. El servidor funcionará de forma limitada.');
    // Mock para evitar que el servidor explote al arrancar
    supabase = {
        from: (table) => ({
            select: () => Promise.reject(new Error(`Falta configurar SUPABASE_URL y SERVICE_KEY para acceder a ${table}`)),
            insert: () => Promise.reject(new Error(`Falta configurar SUPABASE_URL y SERVICE_KEY para acceder a ${table}`)),
            update: () => Promise.reject(new Error(`Falta configurar SUPABASE_URL y SERVICE_KEY para acceder a ${table}`)),
            delete: () => Promise.reject(new Error(`Falta configurar SUPABASE_URL y SERVICE_KEY para acceder a ${table}`)),
        }),
        auth: {
            getUser: (token) => Promise.resolve({ data: { user: null }, error: new Error('Supabase no configurado') })
        }
    };
} else {
    supabase = createClient(supabaseUrl, supabaseKey);
}

module.exports = supabase;
