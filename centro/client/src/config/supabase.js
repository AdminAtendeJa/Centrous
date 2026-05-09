import { createClient } from '@supabase/supabase-js';

// --- CONFIGURACIÓN MAESTRA (AUTENTICACIÓN) ---
const masterUrl = import.meta.env.VITE_SUPABASE_URL;
const masterKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Inicialización segura del cliente de Supabase para evitar crashes en el build
 */
const createSafeClient = (url, key, name) => {
    if (!url || !key) {
        console.error(`❌ [Centrous] Falta configuración para el cliente de Supabase: ${name}`);
        // Retornamos un objeto que no rompa la app al importar, pero que falle al usarlo
        return {
            auth: {
                signInWithPassword: () => Promise.reject(new Error(`Configuración de Supabase (${name}) incompleta.`)),
                signUp: () => Promise.reject(new Error(`Configuración de Supabase (${name}) incompleta.`)),
                signOut: () => Promise.resolve(),
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            },
            from: () => ({
                select: () => Promise.reject(new Error(`Configuración de Supabase (${name}) incompleta.`)),
                insert: () => Promise.reject(new Error(`Configuración de Supabase (${name}) incompleta.`)),
            })
        };
    }
    return createClient(url, key);
};

// Cliente para Auth (Predefinido)
export const supabase = createSafeClient(masterUrl, masterKey, 'Master/Auth');

// --- CONFIGURACIÓN DINÁMICA (DATOS) ---
const savedDataUrl = localStorage.getItem('active_sb_url');
const savedDataKey = localStorage.getItem('active_sb_key');

// El cliente de datos usa el guardado o cae al maestro
export let dataSupabase = createSafeClient(
    savedDataUrl || masterUrl, 
    savedDataKey || masterKey,
    'Data/Dynamic'
);

/**
 * Actualiza el proyecto de datos sin afectar la sesión de Auth
 */
export const updateDataProject = (url, key) => {
    if (!url || !key) {
        localStorage.removeItem('active_sb_url');
        localStorage.removeItem('active_sb_key');
    } else {
        localStorage.setItem('active_sb_url', url.trim());
        localStorage.setItem('active_sb_key', key.trim());
    }
    window.location.reload();
};
