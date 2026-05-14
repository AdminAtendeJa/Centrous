import { useState, useEffect } from 'react';
import { Bot, Sparkles, X, Activity, CheckCircle, FileText, MessageSquare, Copy, Briefcase } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, useCRMStore, useTasksStore, useNotesStore, useProposalsStore, useUIStore, useAIStore, useAnalyticsStore, useAuthStore, useOnboardingStore } from '../../store/index.js';

export default function Copilot() {
    const [open, setOpen] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [showGreeting, setShowGreeting] = useState(true);
    const { settings } = useSettingsStore();
    const { profile } = useOnboardingStore();
    const userName = settings.ownerName || 'empreendedor';

    useEffect(() => {
        const t = setTimeout(() => setShowGreeting(false), 10000);
        return () => clearTimeout(t);
    }, []);

    const addTask = useTasksStore(s => s.addTask);
    const addNote = useNotesStore ? useNotesStore(s => s.addNote) : () => {};
    const setLatestScanResult = useAIStore(s => s.setLatestScanResult);

    const handleAnalyze = async (silent = false) => {
        if (!settings.aiApiKey) {
            if (!silent) toast.error('Configura tu API Key en los Ajustes primero');
            return;
        }

        if (!silent) {
            setAnalyzing(true);
            setResult(null);
        }

        try {
            const context = {
                leads: useCRMStore.getState().leads,
                tasks: useTasksStore.getState().tasks,
                proposals: useProposalsStore.getState().proposals,
                telemetry: useAnalyticsStore.getState(),
                userRole: useAuthStore.getState().user?.user_metadata?.profession || 'Usuario General'
            };

            const systemPrompt = `
Você é o CENTROUS COPILOT, um agente de IA especializado em negócios para empreendedores.

Usuário: ${userName}
Profissão: ${profile?.profession || context.userRole || 'Empreendedor'}
Aplicativos usados: ${profile?.apps?.join(', ') || 'diversos'}

CONTEXTO DO NEGÓCIO:
- ${context.leads?.length || 0} leads no CRM
- ${context.tasks?.filter(t => !t.done)?.length || 0} tarefas pendentes
- ${context.tasks?.filter(t => t.priority === 'high' && !t.done)?.length || 0} tarefas urgentes

SEU OBJETIVO (baseado na profissão do usuário):
1. Resumo tático em 2 frases focado no dia do usuário.
2. Sugerir 2-3 tarefas críticas alinhadas à profissão.
3. Adicionar 1-2 notas estratégicas relevantes.
4. Sugestões de resposta para os leads mais recentes.
5. 1 Ideia de proposta de alto valor.

Responda APENAS JSON puro sem markdown:
{
  "resumen": "string",
  "tareasSugeridas": [ { "texto": "string", "prioridad": "high|medium|low" } ],
  "notasSugeridas": [ { "titulo": "string", "contenido": "string" } ],
  "respuestasSugeridas": [ { "leadName": "string", "mensajeSugerido": "string" } ],
  "propuestaDestacada": { "titulo": "string", "descripcion": "string", "valor": "number" }
}`;

            const res = await axios.post('/api/ai/groq', {
                systemPrompt,
                businessContext: context
            }, {
                headers: {
                    'x-ai-key': settings.aiApiKey,
                    'x-ai-url': settings.aiBaseUrl,
                    'x-ai-model': settings.aiModel
                }
            });

            const data = res.data.data;
            setResult(data);
            setLatestScanResult(data);

            if (data.tareasSugeridas?.length) {
                data.tareasSugeridas.forEach(t => {
                    addTask({ id: Date.now().toString() + Math.random(), title: t.texto || t, done: false, priority: t.prioridad || 'medium' });
                });
                toast.success(`${data.tareasSugeridas.length} tareas auto-añadidas ✨`);
            }
        } catch (error) {
            console.error('Error del copiloto:', error);
            if (!silent) toast.error('Error analizando datos');
        }
        if (!silent) setAnalyzing(false);
    };

    return (
        <>
            <AnimatePresence>
                {showGreeting && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: 110,
                            right: 30, zIndex: 8999,
                            background: '#fff', padding: '12px 16px', borderRadius: '16px 16px 0 16px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '0.5px solid var(--color-border-primary)',
                            fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
                            color: 'var(--color-text-primary)'
                        }}
                    >
                        <span>Olá {userName}! Sou seu Copiloto 🤖. Vamos escanear seu dia?</span>
                        <button onClick={() => setShowGreeting(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}><X size={14} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                drag
                dragConstraints={{ left: -1000, right: 0, top: -1000, bottom: 0 }}
                dragElastic={0.1}
                dragMomentum={false}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setOpen(true); setShowGreeting(false); }}
                style={{
                    position: 'fixed',
                    bottom: 40,
                    right: 30, zIndex: 9000,
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white',
                    border: 'none', width: 56, height: 56, borderRadius: '20px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                }}
            >
                <Sparkles size={24} />
            </motion.button>

            <AnimatePresence>
                {open && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', pointerEvents: 'none' }}>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 15, 18, 0.4)', backdropFilter: 'blur(4px)', pointerEvents: 'auto' }} 
                            onClick={() => setOpen(false)} 
                        />

                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            style={{
                                pointerEvents: 'auto',
                                width: 380, background: '#ffffff', margin: '0 30px 110px 0',
                                borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
                                border: '0.5px solid var(--color-border-primary)', overflow: 'hidden', position: 'relative'
                            }}
                        >
                            <div style={{ background: '#0f172a', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: 8, borderRadius: 10 }}><Bot size={18} color="white" /></div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 14, color: 'white', fontWeight: 700 }}>Centrous Copilot</h3>
                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Inteligência Proativa v3</span>
                                    </div>
                                </div>
                                <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}><X size={18} /></button>
                            </div>

                            <div style={{ padding: 20, maxHeight: 500, overflowY: 'auto' }}>
                                {!result && !analyzing && (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <div style={{ background: 'var(--color-background-secondary)', padding: 16, borderRadius: 16, marginBottom: 20 }}>
                                            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                                Estou pronto para escanear todo o seu workspace e gerar estratégias de crescimento para hoje.
                                            </p>
                                        </div>
                                        <button 
                                            className="btn-v3-primary w-full" 
                                            onClick={() => handleAnalyze()}
                                            style={{ height: 40 }}
                                        >
                                            <Activity size={14} /> Iniciar Análise de Negócio
                                        </button>
                                    </div>
                                )}

                                {analyzing && (
                                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <div className="flex-center mb-4">
                                            <div style={{ width: 32, height: 32, border: '3px solid var(--color-accent-light)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                        </div>
                                        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Lendo dados do Supabase...<br />Gerando insights cognitivos...</p>
                                    </div>
                                )}

                                {result && (
                                    <div className="flex flex-col gap-4">
                                        <div style={{ background: 'var(--color-accent-light)', padding: 16, borderRadius: 16, border: '0.5px solid var(--color-accent)' }}>
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: 10, color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: 800 }}>Resumo Estratégico</h4>
                                            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: 'var(--color-text-primary)', fontWeight: 500 }}>{result.resumen}</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <h4 style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Ações Recomendadas</h4>
                                            {result.tareasSugeridas?.map((t, i) => (
                                                <div key={i} style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '0.5px solid var(--color-border-primary)', fontSize: 11, fontWeight: 600 }}>
                                                    {t.texto || t}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <button className="btn-v3-ghost w-full mt-2" onClick={() => setResult(null)}>Novo Escaneamento</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
