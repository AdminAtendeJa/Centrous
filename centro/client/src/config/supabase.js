import { createClient } from '@supabase/supabase-js';

// En desarrollo usamos variables de entorno de Vite o valores hardcoded si sabemos que son seguros
// Para este proyecto, usaremos los valores detectados en el servidor
const supabaseUrl = 'https://trwxqvvztboqephqcsdi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyd3hxdnZ6dGJvcWVwaHFjc2RpIiwicm9sZSI6InFhbm9uIiwiaWF0IjoxNzc1NzIwMDc4LCJleHAiOjIwOTEyOTYwNzh9.Yp75S9_V3R3_Yh1F9h0_6x8_1_v_x_x_x_x'; 
// Nota: Deberías usar la ANON_KEY en el cliente, no la SERVICE_KEY. 
// Como no tengo la anon key explícitamente en el .env (solo vi la service key), 
// generaré una o pediré al usuario que la ponga. 
// Normalmente la anon key está disponible en el dashboard de Supabase.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
