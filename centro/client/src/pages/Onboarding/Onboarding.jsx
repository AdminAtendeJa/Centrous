import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore, useAuthStore } from '../../store/index.js';
import { useSettingsStore } from '../../store/index.js';
import './Onboarding.css';

const PROFESSIONS = [
    { emoji: '🎨', label: 'Designer / Criativo', desc: 'Design gráfico, UX, branding, ilustração' },
    { emoji: '📱', label: 'Criador de Conteúdo', desc: 'YouTube, TikTok, Instagram, podcasts' },
    { emoji: '📊', label: 'Marketer / Publicidade', desc: 'Ads, estratégia digital, email marketing' },
    { emoji: '💻', label: 'Desenvolvedor', desc: 'Web, apps, software, freelance tech' },
    { emoji: '🎓', label: 'Coach / Consultor', desc: 'Treinamento, mentoria, consultoria' },
    { emoji: '🏪', label: 'Empreendedor', desc: 'Dono de negócio, startup, pequena empresa' },
    { emoji: '💼', label: 'Vendas / Comercial', desc: 'SDR, AE, gestor comercial, BDR' },
    { emoji: '✨', label: 'Outro / Múltiplo', desc: 'Combino vários papéis ou é diferente' },
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
    { icon: '🗄️', label: 'Supabase' }, { icon: '⚡', label: 'n8n' },
];

const CLIENT_TIERS = [
    { emoji: '🌱', label: 'Só começando', desc: '0–5 clientes ativos' },
    { emoji: '🚀', label: 'Em crescimento', desc: '5–20 clientes ativos' },
    { emoji: '🏆', label: 'Estabelecido', desc: '20+ clientes ou comunidade grande' },
    { emoji: '🌍', label: 'Internacional', desc: 'Clientes em múltiplos países' },
];

const MODULES = [
    { color: '#00d4aa', icon: '📬', label: 'Caixa de entrada unificada' },
    { color: '#6c63ff', icon: '📊', label: 'Painel Meta Ads' },
    { color: '#ff6b6b', icon: '👥', label: 'CRM de Clientes' },
    { color: '#00d4aa', icon: '📱', label: 'Social Media Hub' },
    { color: '#6c63ff', icon: '💰', label: 'Gestão Financeira' },
    { color: '#4ade80', icon: '🤖', label: 'Copilot IA Proativo' },
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
    const aiMessage = 'Antes de começar, preciso te conhecer um pouco. Em menos de 2 minutos terei seu workspace pronto e personalizado. Vamos começar?';
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

    const handleFinish = async () => {
        const profile = { userName, profession, apps: [...selectedApps], clientTier };
        
        updateSettings({ ownerName: userName || 'Usuário', companyName: userName ? `Negócio de ${userName}` : 'Minha Empresa' });
        completeOnboarding(profile);

        // Sync with backend — useAuthStore is properly imported now
        const token = useAuthStore.getState().session?.access_token;
        if (token) {
            try {
                await fetch('/api/user/profile', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: userName,
                        profession,
                        apps: [...selectedApps],
                        client_tier: clientTier
                    })
                });
            } catch (err) {
                console.error('Error syncing profile:', err);
            }
        }

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
                    Centrous <span>AI</span>
                </div>
                <div className="ob-step-counter">Passo {step} de {TOTAL_STEPS}</div>
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
                            <h1 className="ob-title">Olá, sou o <span className="ob-highlight">Centrous AI</span> 👋</h1>
                            <p className="ob-subtitle">Seu workspace inteligente que se adapta a você. Responda algumas perguntas rápidas e configuro tudo automaticamente.</p>

                            <div className="ob-ai-box">
                                <div className="ob-ai-avatar">🤖</div>
                                <p className="ob-ai-text">
                                    {typedText}
                                    {!typingDone && <span className="ob-cursor" />}
                                </p>
                            </div>

                            <div className="ob-input-group">
                                <label className="ob-label">Como você se chama?</label>
                                <input
                                    className="ob-input"
                                    type="text"
                                    placeholder="Seu nome ou apelido..."
                                    value={userName}
                                    onChange={e => setUserName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && goTo(2)}
                                    autoFocus
                                />
                            </div>

                            <button className="ob-btn" onClick={() => goTo(2)}>
                                Começar configuração →
                            </button>
                        </>
                    )}

                    {/* ── STEP 2: Profession ── */}
                    {step === 2 && (
                        <>
                            <div className="ob-badge">Seu perfil</div>
                            <h1 className="ob-title">Qual é sua <span className="ob-highlight">profissão?</span></h1>
                            <p className="ob-subtitle">Isso me ajuda a priorizar as ferramentas mais relevantes para você.</p>

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
                            <div className="ob-badge">Suas ferramentas</div>
                            <h1 className="ob-title">Quais apps você <span className="ob-highlight">usa hoje?</span></h1>
                            <p className="ob-subtitle">Selecione todos que você usa. Vou conectá-los diretamente ao seu workspace.</p>

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
                            <div className="ob-badge">Sua operação</div>
                            <h1 className="ob-title">Me conta sobre <span className="ob-highlight">seus clientes</span></h1>
                            <p className="ob-subtitle">Assim configuro o CRM e os painéis de métricas corretamente.</p>

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

                            <button className="ob-btn" onClick={() => goTo(5)}>Quase lá! →</button>
                        </>
                    )}

                    {/* ── STEP 5: Ready ── */}
                    {step === 5 && (
                        <div className="ob-final">
                            <div className="ob-final-icon">⚡</div>
                            <div className="ob-badge" style={{ display: 'inline-flex', marginBottom: 16 }}>Workspace Pronto</div>
                            <h1 className="ob-title">Seu workspace <span className="ob-highlight">está configurado{userName ? `, ${userName}` : ''}</span></h1>
                            <p className="ob-subtitle">A IA analisou seu perfil e preparou tudo. Isso é o que ativei para você:</p>

                            <div className="ob-modules-box">
                                <div className="ob-modules-title">✦ Módulos ativados pela IA</div>
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
                                Entrar no meu workspace →
                            </button>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
