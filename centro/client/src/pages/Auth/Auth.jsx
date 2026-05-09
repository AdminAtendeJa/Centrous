import { useState } from 'react';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/index.js';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import './Auth.css';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const { setSession } = useAuthStore();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                setSession(data.session);
                toast.success('¡Bienvenido de nuevo!');
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.session) {
                    setSession(data.session);
                    toast.success('Cuenta creada con éxito');
                } else {
                    toast.success('Revisa tu correo para confirmar tu cuenta');
                }
            }
        } catch (error) {
            toast.error(error.message || 'Error en la autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-root">
            <div className="auth-grid" />
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />

            <main className="auth-main">
                <motion.div 
                    className="auth-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="auth-header">
                        <div className="auth-logo">⚡</div>
                        <h1 className="auth-title">
                            {isLogin ? 'Bienvenido a ' : 'Únete a '}
                            <span className="auth-highlight">Centrous</span>
                        </h1>
                        <p className="auth-subtitle">
                            {isLogin 
                                ? 'Ingresa tus credenciales para acceder a tu workspace inteligente.' 
                                : 'Comienza tu viaje con la IA más avanzada para tu negocio.'}
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={handleAuth}>
                        <div className="auth-input-group">
                            <label>Correo electrónico</label>
                            <input 
                                type="email" 
                                placeholder="tu@email.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="auth-input-group">
                            <label>Contraseña</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button className="auth-btn" type="submit" disabled={loading}>
                            {loading ? (
                                <div className="auth-loader" />
                            ) : (
                                isLogin ? 'Iniciar Sesión →' : 'Crear Cuenta →'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <button 
                            className="auth-switch-btn"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin 
                                ? '¿No tienes cuenta? Regístrate' 
                                : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
