# 🔐 Guía de Autenticación con Gmail - Centro

## 📋 Resumen

Se ha implementado **autenticación con Gmail usando Google OAuth 2.0** en tu aplicación Centro. El sistema:

✅ Autentica usuarios con sus cuentas de Google  
✅ Guarda automáticamente todos los datos del usuario en Supabase  
✅ Vincula leads con usuarios autenticados  
✅ Maneja sesiones y tokens JWT  
✅ Permite editar perfil de usuario  

---

## 🔧 Configuración Requerida

### 1. Google Cloud Console Setup

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Google+ API**
4. Ve a **Credenciales** y crea **OAuth 2.0 Client ID**:
   - Tipo: Aplicación Web
   - URI autorizados:
     - `http://localhost:3001`
     - `http://localhost:3001/api/auth/google/callback`
   - Orígenes autorizados:
     - `http://localhost:3001`
     - `http://localhost:5173` (frontend dev)

5. Copia el **Client ID** y **Client Secret**

### 2. Variables de Entorno (.env)

```env
# Google OAuth
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# JWT Secret (mínimo 32 caracteres)
JWT_SECRET=tu-clave-super-secreta-minimo-32-caracteres-aqui

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Ejecutar el Script de Base de Datos

Ejecuta el siguiente SQL en tu Supabase:

```bash
# En Supabase Dashboard > SQL Editor
# Pega el contenido de: centro/server/database_schema_update.sql
```

Esto crea:
- Tabla `users` - datos de usuario
- Tabla `user_sessions` - sesiones activas
- Relación con tabla `leads`

---

## 📦 Instalar Dependencias

```bash
cd centro/server
npm install

cd ../client
npm install
```

---

## 🚀 Flujo de Autenticación

### Backend (/api/auth/*)

```
1. Usuario clickea "Iniciar sesión con Google"
   ↓
2. GET /api/auth/google
   → Redirige a Google OAuth consent screen
   ↓
3. Usuario autoriza la app
   ↓
4. Google redirige a: GET /api/auth/google/callback
   → Estrategia Passport valida el código
   → Busca/crea usuario en Supabase
   → Genera JWT token
   → Redirige a frontend: /?token=xxx&user={...}
   ↓
5. Frontend guarda token y user en localStorage
```

### Rutas de Autenticación

```javascript
// Iniciar sesión con Google
GET /api/auth/google

// Callback de Google
GET /api/auth/google/callback

// Obtener datos del usuario actual
GET /api/auth/me
Headers: Authorization: Bearer <token>

// Actualizar perfil
PUT /api/auth/profile
Body: { name, company, phone }

// Cerrar sesión
POST /api/auth/logout

// Obtener todos los usuarios (ADMIN)
GET /api/auth/users
```

---

## 🔐 Proteger Rutas

### Backend

Importa el middleware en tus rutas:

```javascript
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Ruta protegida
router.get('/mi-ruta', verifyToken, (req, res) => {
    console.log('Usuario:', req.user); // Acceso al usuario autenticado
    res.json({ message: 'Solo usuarios autenticados' });
});

// Ruta solo para admins
router.delete('/peligroso', verifyToken, verifyAdmin, (req, res) => {
    res.json({ message: 'Solo admins' });
});
```

### Frontend

Usa `PrivateRoute` para proteger componentes:

```javascript
import PrivateRoute from './components/PrivateRoute';

<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/dashboard" element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  } />
</Routes>
```

---

## 📊 Estructura de Datos

### Tabla: users

```sql
{
  id: UUID,
  google_id: string,
  email: string,
  name: string,
  picture: string,
  phone: string,
  company: string,
  role: 'user' | 'admin',
  verified_email: boolean,
  last_login: timestamp,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Tabla: user_sessions

```sql
{
  id: UUID,
  user_id: UUID (referencia a users),
  access_token: string,
  refresh_token: string,
  expires_at: timestamp,
  ip_address: string,
  user_agent: string,
  created_at: timestamp
}
```

---

## 🎨 Componentes Creados

### 1. **LoginPage.jsx**
   - Página de login con botón de Google
   - Procesa el callback y guarda el token

### 2. **GoogleLoginButton.jsx**
   - Botón reutilizable para iniciar sesión

### 3. **AuthContext.jsx**
   - Context de React para manejar estado global del usuario
   - Hooks: `useAuth()`

### 4. **PrivateRoute.jsx**
   - Componente para rutas protegidas

### 5. **UserProfile.jsx**
   - Vista de perfil del usuario
   - Editar información personal
   - Cerrar sesión

---

## 🔄 Vincular Leads con Usuario Autenticado

En tu ruta de creación de leads, captura el usuario:

```javascript
router.post('/leads', verifyToken, async (req, res) => {
    const { name, company, value, stage, channel, notes } = req.body;
    const userId = req.user.id; // ← Usuario autenticado

    try {
        const newLeadData = {
            name,
            company,
            value,
            stage,
            channel,
            notes,
            user_id: userId, // ← Vincular con usuario
        };

        const { data: insertedLead, error } = await supabase
            .from('leads')
            .insert([newLeadData])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, lead: insertedLead });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error creating lead' });
    }
});
```

---

## 📝 Notas de Seguridad

1. **Nunca guardes el JWT Secret en git** → usa .env
2. **HTTPS en producción** → OAuth no funciona con HTTP
3. **Token expira en 7 días** → implementar refresh token si es necesario
4. **Valida siempre en backend** → no confíes solo en el frontend

---

## 🐛 Troubleshooting

### "Google OAuth callback URL no coincide"
→ Verifica que `GOOGLE_REDIRECT_URI` en .env sea igual al registrado en Google Cloud Console

### "Token inválido"
→ Verifica que `JWT_SECRET` sea igual en variables de entorno

### "Usuario no encontrado en BD"
→ Ejecuta `database_schema_update.sql` en Supabase

### "CORS error"
→ Verifica `ALLOWED_ORIGIN` en .env coincida con tu frontend URL

---

## 📚 Recursos Útiles

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [JWT.io - JSON Web Tokens](https://jwt.io/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## ✅ Checklist de Implementación

- [ ] Clonar/actualizar el repositorio
- [ ] Crear Google OAuth credentials
- [ ] Configurar variables en .env
- [ ] Ejecutar SQL script en Supabase
- [ ] `npm install` en server y client
- [ ] `npm run dev` en ambas carpetas
- [ ] Probar flujo de login en http://localhost:5173/login
- [ ] Verificar que usuario se guarde en Supabase
- [ ] Vincular leads con usuario autenticado

¡Listo! 🎉
