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
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            },
            from: () => ({
                select: () => Promise.reject(new Error(`Configuración de Supabase (${name}) incompleta.`)),
                insert: () => Promise.reject(new Error(`Configuración de Supabase (${name}) incompleta.`)),
                update: () => Promise.reject(new Error(`Configuración de Supabase (${name}) incompleta.`)),
                delete: () => Promise.reject(new Error(`Configuración de Supabase (${name}) incompleta.`)),
                eq: () => ({ select: () => Promise.reject(new Error(`Configuración de Supabase (${name}) incompleta.`)) }),
                order: () => ({ select: () => Promise.reject(new Error(`Configuración de Supabase (${name}) incompleta.`)) }),
            })
        };
    }
    return createClient(url, key);
};

// Cliente para Auth (Predefinido - Siempre necesario para entrar)
export const supabase = createSafeClient(masterUrl, masterKey, 'Master/Auth');

// --- CONFIGURACIÓN DINÁMICA (DATOS DEL USUARIO) ---
const savedDataUrl = localStorage.getItem('active_sb_url');
const savedDataKey = localStorage.getItem('active_sb_key');

// IMPORTANTE: Ya NO cae al maestro. Si no hay configuración, está vacío.
export let dataSupabase = createSafeClient(
    savedDataUrl, 
    savedDataKey,
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
