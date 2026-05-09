import { createClient } from '@supabase/supabase-js';

// 1. CLIENTE DE AUTENTICACIÓN (Fijo para el login de la app)
// Este proyecto guarda las cuentas de los usuarios de Centrous
const masterUrl = import.meta.env.VITE_SUPABASE_URL || 'https://trwxqvvztboqephqcsdi.supabase.co';
const masterKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyd3hxdnZ6dGJvcWVwaHFjc2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjAwNzgsImV4cCI6MjA5MTI5NjA3OH0.TEMP_KEY_PROVIDE_REAL_ONE'; 

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Centrous: VITE_SUPABASE_ANON_KEY no detectada. Usando llave temporal para evitar crash.');
}

export const supabase = createClient(masterUrl, masterKey);

// 2. CLIENTE DE DATOS (Dinámico - Configurable por el usuario)
// Este es el que el usuario configura en Ajustes para ver sus propias tablas
const savedDataUrl = localStorage.getItem('active_sb_url');
const savedDataKey = localStorage.getItem('active_sb_key');

export let dataSupabase = createClient(
    savedDataUrl || masterUrl, 
    savedDataKey || masterKey
);

/**
 * Función para actualizar la base de datos de trabajo sin cerrar sesión
 */
export const updateDataProject = (url, key) => {
    if (!url || !key) {
        localStorage.removeItem('active_sb_url');
        localStorage.removeItem('active_sb_key');
        dataSupabase = createClient(masterUrl, masterKey);
    } else {
        localStorage.setItem('active_sb_url', url);
        localStorage.setItem('active_sb_key', key);
        dataSupabase = createClient(url, key);
    }
    // No necesitamos recargar toda la app, solo notificar a los stores
    // Pero por simplicidad en esta fase, un reload asegura que todo se refresque
    window.location.reload();
};
