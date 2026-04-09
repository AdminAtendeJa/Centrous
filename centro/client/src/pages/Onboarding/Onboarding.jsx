import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '../../store/index.js';
import { useSettingsStore } from '../../store/index.js';
import './Onboarding.css';

const PROFESSIONS = [
    { emoji: '🎨', label: 'Diseñador / Creativo', desc: 'Diseño gráfico, UX, branding, ilustración' },
    { emoji: '📱', label: 'Creador de Contenido', desc: 'YouTube, TikTok, Instagram, podcasts' },
    { emoji: '📊', label: 'Marketer / Publicista', desc: 'Ads, estrategia digital, email marketing' },
    { emoji: '💻', label: 'Desarrollador', desc: 'Web, apps, software, freelance tech' },
    { emoji: '🎓', label: 'Coach / Consultor', desc: 'Formación, mentoría, consultoría' },
    { emoji: '✨', label: 'Otro / Múltiple', desc: 'Combino varios roles o es diferente' },
];

const APPS = [
    { icon: '📧', label: 'Gmail' }, { icon: '📸', label: 'Instagram' },
    { icon: '🎵', label: 'TikTok' }, { icon: '▶️', label: 'YouTube' },
    { icon: '💼', label: 'LinkedIn' }, { icon: '🐦', label: 'X / Twitter' },
    { icon: '📘', label: 'Meta Ads' }, { icon: '🗂️', label: 'Notion' },
    { icon: '✅', label: 'Trello' }, { icon: '📁', label: 'Google Drive' },
    { icon: '💳', label: 'Stripe' }, { icon: '🎨', label: 'Canva' },
    { icon: '💬', label: 'WhatsApp Business' }, { icon: '📹', label: 'Zoom' },
    { icon: '🛒', label: 'Shopify' }, { icon: '💡', label: 'Figma' },
];

const CLIENT_TIERS = [
    { emoji: '🌱', label: 'Solo empezando', desc: '0–5 clientes activos' },
    { emoji: '🚀', label: 'En crecimiento', desc: '5–20 clientes activos' },
    { emoji: '🏆', label: 'Establecido', desc: '20+ clientes o comunidad grande' },
    { emoji: '🌍', label: 'Internacional', desc: 'Clientes en múltiples países' },
];

const MODULES = [
    { color: '#00d4aa', icon: '📬', label: 'Bandeja unificada' },
    { color: '#6c63ff', icon: '📊', label: 'Meta Ads Panel' },
    { color: '#ff6b6b', icon: '👥', label: 'CRM Clientes' },
    { color: '#00d4aa', icon: '📱', label: 'Social Media Hub' },
    { color: '#6c63ff', icon: '📅', label: 'Agenda IA' },
    { color: '#4ade80', icon: '📈', label: 'Analytics Pro' },
];

const TOTAL_STEPS = 5;

export default function Onboarding() {
    const navigate = useNavigate();
    const { completeOnboarding } = useOnboardingStore();
    const { updateSettings } = useSettingsStore();

    const [step, setStep] = useState(1);
    const [animKey, setAnimKey] = useState(0);
    const [exiting, setExiting] = useState(false);

    // Form state
    const [userName, setUserName] = useState('');
    const [profession, setProfession] = useState(null);
    const [selectedApps, setSelectedApps] = useState(new Set());
    const [clientTier, setClientTier] = useState(null);

    // Typing effect state
    const [typedText, setTypedText] = useState('');
    const [typingDone, setTypingDone] = useState(false);
    const aiMessage = 'Antes de empezar, necesito conocerte un poco. En menos de 2 minutos tendré tu workspace listo y personalizado. ¿Empezamos?';
    const typingRef = useRef(null);

    useEffect(() => {
        if (step !== 1) return;
        setTypedText('');
        setTypingDone(false);
        let i = 0;
        const timer = setTimeout(() => {
            typingRef.current = setInterval(() => {
                i++;
                setTypedText(aiMessage.substring(0, i));
                if (i >= aiMessage.length) {
                    clearInterval(typingRef.current);
                    setTypingDone(true);
                }
            }, 22);
        }, 600);
        return () => { clearTimeout(timer); clearInterval(typingRef.current); };
    }, [step]);

    const goTo = (next) => {
        setExiting(true);
        setTimeout(() => {
            setStep(next);
            setAnimKey(k => k + 1);
            setExiting(false);
        }, 220);
    };

    const toggleApp = (label) => {
        setSelectedApps(prev => {
            const next = new Set(prev);
            next.has(label) ? next.delete(label) : next.add(label);
            return next;
        });
    };

    const handleFinish = () => {
        updateSettings({ ownerName: userName || 'Usuario' });
        completeOnboarding({ userName, profession, apps: [...selectedApps], clientTier });
        setExiting(true);
        setTimeout(() => navigate('/dashboard', { replace: true }), 400);
    };

    const progress = (step / TOTAL_STEPS) * 100;

    return (
        <div className="ob-root">
            {/* Background */}
            <div className="ob-grid" />
            <div className="ob-orb ob-orb-1" />
            <div className="ob-orb ob-orb-2" />

            {/* Header */}
            <header className="ob-header">
                <div className="ob-logo">
                    <div className="ob-logo-icon">⚡</div>
                    WorkHub <span>AI</span>
                </div>
                <div className="ob-step-counter">Paso {step} de {TOTAL_STEPS}</div>
            </header>

            {/* Progress */}
            <div className="ob-progress-bar">
                <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Content */}
            <main className="ob-main">
                <div className={`ob-container ${exiting ? 'ob-exit' : ''}`} key={animKey}>

                    {/* ── STEP 1: Welcome ── */}
                    {step === 1 && (
                        <>
                            <div className="ob-badge">Onboarding IA</div>
                            <h1 className="ob-title">Hola, soy <span className="ob-highlight">WorkHub AI</span> 👋</h1>
                            <p className="ob-subtitle">Tu workspace inteligente que se adapta a ti. Responde unas preguntas rápidas y configuro todo automáticamente.</p>

                            <div className="ob-ai-box">
                                <div className="ob-ai-avatar">🤖</div>
                                <p className="ob-ai-text">
                                    {typedText}
                                    {!typingDone && <span className="ob-cursor" />}
                                </p>
                            </div>

                            <div className="ob-input-group">
                                <label className="ob-label">¿Cómo te llamas?</label>
                                <input
                                    className="ob-input"
                                    type="text"
                                    placeholder="Tu nombre o apodo..."
                                    value={userName}
                                    onChange={e => setUserName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && goTo(2)}
                                    autoFocus
                                />
                            </div>

                            <button className="ob-btn" onClick={() => goTo(2)}>
                                Comenzar configuración →
                            </button>
                        </>
                    )}

                    {/* ── STEP 2: Profession ── */}
                    {step === 2 && (
                        <>
                            <div className="ob-badge">Tu perfil</div>
                            <h1 className="ob-title">¿A qué te <span className="ob-highlight">dedicas?</span></h1>
                            <p className="ob-subtitle">Esto me ayuda a priorizar las herramientas más relevantes para ti.</p>

                            <div className="ob-options-grid">
                                {PROFESSIONS.map((p) => (
                                    <div
                                        key={p.label}
                                        className={`ob-option-card ${profession === p.label ? 'ob-selected' : ''}`}
                                        onClick={() => setProfession(p.label)}
                                    >
                                        <span className="ob-option-emoji">{p.emoji}</span>
                                        <div className="ob-option-label">{p.label}</div>
                                        <div className="ob-option-desc">{p.desc}</div>
                                    </div>
                                ))}
                            </div>

                            <button className="ob-btn" onClick={() => goTo(3)}>Continuar →</button>
                        </>
                    )}

                    {/* ── STEP 3: Apps ── */}
                    {step === 3 && (
                        <>
                            <div className="ob-badge">Tus herramientas</div>
                            <h1 className="ob-title">¿Qué apps <span className="ob-highlight">usas hoy?</span></h1>
                            <p className="ob-subtitle">Selecciona todas las que uses. Las conectaré directamente a tu workspace.</p>

                            <div className="ob-chips">
                                {APPS.map((a) => (
                                    <div
                                        key={a.label}
                                        className={`ob-chip ${selectedApps.has(a.label) ? 'ob-chip-selected' : ''}`}
                                        onClick={() => toggleApp(a.label)}
                                    >
                                        <span>{a.icon}</span> {a.label}
                                    </div>
                                ))}
                            </div>

                            <button className="ob-btn" onClick={() => goTo(4)}>Continuar →</button>
                        </>
                    )}

                    {/* ── STEP 4: Clients ── */}
                    {step === 4 && (
                        <>
                            <div className="ob-badge">Tu operación</div>
                            <h1 className="ob-title">Cuéntame sobre <span className="ob-highlight">tus clientes</span></h1>
                            <p className="ob-subtitle">Así configuro el CRM y los paneles de métricas correctamente.</p>

                            <div className="ob-options-grid ob-options-grid-2">
                                {CLIENT_TIERS.map((c) => (
                                    <div
                                        key={c.label}
                                        className={`ob-option-card ${clientTier === c.label ? 'ob-selected' : ''}`}
                                        onClick={() => setClientTier(c.label)}
                                    >
                                        <span className="ob-option-emoji">{c.emoji}</span>
                                        <div className="ob-option-label">{c.label}</div>
                                        <div className="ob-option-desc">{c.desc}</div>
                                    </div>
                                ))}
                            </div>

                            <button className="ob-btn" onClick={() => goTo(5)}>¡Casi listo! →</button>
                        </>
                    )}

                    {/* ── STEP 5: Ready ── */}
                    {step === 5 && (
                        <div className="ob-final">
                            <div className="ob-final-icon">⚡</div>
                            <div className="ob-badge" style={{ display: 'inline-flex', marginBottom: 16 }}>Workspace Listo</div>
                            <h1 className="ob-title">Tu workspace <span className="ob-highlight">está configurado</span></h1>
                            <p className="ob-subtitle">La IA analizó tu perfil y preparó todo. Esto es lo que activé para ti:</p>

                            <div className="ob-modules-box">
                                <div className="ob-modules-title">✦ Módulos activados por la IA</div>
                                <div className="ob-modules-grid">
                                    {MODULES.map((m, i) => (
                                        <div key={m.label} className="ob-module" style={{ animationDelay: `${i * 0.1}s` }}>
                                            <div className="ob-module-dot" style={{ background: m.color }} />
                                            {m.icon} {m.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="ob-btn" onClick={handleFinish}>
                                Entrar a mi workspace →
                            </button>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
