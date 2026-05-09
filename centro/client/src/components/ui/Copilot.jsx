import { useState, useEffect } from 'react';
import { Bot, Sparkles, X, Activity, CheckCircle, FileText, MessageSquare, Copy, Briefcase } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSettingsStore, useCRMStore, useTasksStore, useNotesStore, useProposalsStore, useUIStore, useAIStore, useAnalyticsStore, useAuthStore } from '../../store/index.js';

export default function Copilot() {
    const [open, setOpen] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [showGreeting, setShowGreeting] = useState(true);
    const { settings } = useSettingsStore();

    // Ocultar el saludo después de 10 segundos
    useEffect(() => {
        const t = setTimeout(() => setShowGreeting(false), 10000);
        return () => clearTimeout(t);
    }, []);

    // Accedemos a las funciones de mutación de Zustand
    const addTask = useTasksStore(s => s.addTask);
    const addNote = useNotesStore ? useNotesStore(s => s.addNote) : () => console.log('NotesStore no detectado'); // Fallback si notesStore se llama distinto
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
Eres GROQ COPILOT, un agente de IA experto. Tienes acceso a la memoria cognitiva del usuario y su telemetría en tiempo real.
El usuario actual tiene el rol de: **${context.userRole}**. Debes adaptar tu tono, sugerencias y enfoque a las necesidades de este rol (ej. si es creador, háblale sobre alcance y audiencia; si es vendedor, háblale de cierres y pipeline; si es desarrollador, enfócate en sistemas y eficiencia).

Acabas de leer la base de datos de un CRM, Gestor de Tareas y su telemetría (qué módulos visita más, qué acciones toma).

TU OBJETIVO:
1. Crear un resumen táctico de 2 oraciones del estado del negocio, mencionando algo específico sobre sus hábitos recientes o módulos más usados.
2. Sugerir 2-3 tareas críticas faltantes.
3. Añadir 1-2 notas estratégicas a nivel directivo (adaptadas a su rol).
4. Redactar respuestas exactas a clientes: Para los leads activos que requieren respuesta.
5. Sugerir 1 Propuesta: Genera una oferta o "hook" comercial.

REGLA ESTRICTA:
Debes responder ÚNICA Y EXCLUSIVAMENTE con un objeto JSON crudo, sin markdown tags.
Estructura JSON esperada:
{
  "resumen": "string",
  "tareasSugeridas": [ { "texto": "string", "prioridad": "high|medium|low" } ],
  "notasSugeridas": [ { "titulo": "string", "contenido": "string" } ],
  "respuestasSugeridas": [ { "leadName": "string", "mensajeSugerido": "string" } ],
  "propuestaDestacada": { "titulo": "string", "descripcion": "string", "valor": "number" }
}
            `;

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

            const data = res.data.data; // JSON parseado
            setResult(data);
            setLatestScanResult(data);

            // AUTO AÑADIR DATOS
            if (data.tareasSugeridas?.length) {
                data.tareasSugeridas.forEach(t => {
                    addTask({ id: Date.now().toString() + Math.random(), text: t.texto || t, done: false, priority: t.prioridad || 'medium' });
                });
                toast.success(`${data.tareasSugeridas.length} tareas auto-añadidas ✨`);
            }

            if (data.notasSugeridas?.length && useNotesStore) {
                // Si el store de notas soporta addNote
                data.notasSugeridas.forEach(n => {
                    addNote && addNote({
                        id: Date.now().toString() + Math.random(),
                        title: n.titulo || 'Nota AI',
                        content: n.contenido || n,
                        tags: ['AI']
                    });
                });
            }

        } catch (error) {
            console.error('Error del copiloto:', error);
            if (!silent) toast.error(error.response?.data?.message || 'Error analizando datos');
        }

        if (!silent) setAnalyzing(false);
    };

    // PROACTIVIDAD SILENCIOSA CADA 30 MINUTOS
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('🤖 Copilot: Ejecutando análisis proactivo en background...');
            handleAnalyze(true);
        }, 1800000); // 30 minutos
        return () => clearInterval(interval);
    }, [settings.aiApiKey]);

    const isDrawerExpanded = useUIStore(s => s.isDrawerExpanded);

    return (
        <>
            <style>{`
                @keyframes heartbeat {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7); }
                    50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(124, 58, 237, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
                }
                .ai-pulse { animation: heartbeat 2s infinite; }
            `}</style>

            {showGreeting && (
                <div className="animate-in" style={{
                    position: 'fixed',
                    bottom: isDrawerExpanded ? 240 : 110,
                    right: 30, zIndex: 8999,
                    background: 'var(--color-surface)', padding: '12px 16px', borderRadius: '16px 16px 0 16px',
                    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)',
                    fontSize: 13, display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    <span>Hola, soy tu Copiloto 🤖. Ya revisé todo tu CRM.</span>
                    <button onClick={() => setShowGreeting(false)} className="btn-icon btn-sm"><X size={14} /></button>
                </div>
            )}

            <button
                onClick={() => { setOpen(true); setShowGreeting(false); }}
                className="ai-pulse"
                style={{
                    position: 'fixed',
                    bottom: isDrawerExpanded ? 160 : 40,
                    right: 30, zIndex: 9000,
                    background: 'linear-gradient(135deg, #7c3aed, #db2777)', color: 'white',
                    border: 'none', width: 60, height: 60, borderRadius: '50%',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                <Sparkles size={28} />
            </button>

            {open && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', pointerEvents: 'auto' }} onClick={() => setOpen(false)} />

                    <div className="animate-in" style={{
                        pointerEvents: 'auto',
                        width: 400, background: 'var(--color-surface)', margin: '0 30px 100px 0',
                        borderRadius: 24, boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column',
                        border: '1px solid var(--color-border)', overflow: 'hidden', position: 'relative'
                    }}>
                        <div style={{ background: 'linear-gradient(135deg, #1e1e2e, #2d2b42)', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', padding: 8, borderRadius: 12 }}><Bot size={20} color="white" /></div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 16, color: 'white' }}>Groq Copilot</h3>
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Powered by Llama 3 🚀</span>
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)} className="btn-icon" style={{ color: 'white' }}><X size={18} /></button>
                        </div>

                        <div style={{ padding: 20, maxHeight: 600, overflowY: 'auto' }}>
                            {!result && !analyzing && (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '30px 0' }}>
                                    <p style={{ marginBottom: 20 }}>Estoy lísto para escanear todo tu negocio y gestionar tareas por ti.</p>
                                    <button className="btn btn-primary" onClick={handleAnalyze} style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed, #db2777)', border: 'none' }}>
                                        <Activity size={16} /> Analizar Workspace Completo
                                    </button>
                                </div>
                            )}

                            {analyzing && (
                                <div style={{ textAlign: 'center', margin: '40px 0' }}>
                                    <div className="loading-spinner" style={{ margin: '0 auto', borderColor: '#7c3aed', borderTopColor: 'transparent', width: 40, height: 40 }} />
                                    <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>Leyendo datos de Zustand en tiempo real...<br />Generando estrategias cognitivas...</p>
                                </div>
                            )}

                            {result && (
                                <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', padding: 16, borderRadius: 12 }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1 }}>RESUMEN EJECUTIVO</h4>
                                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{result.resumen}</p>
                                    </div>

                                    <div>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={14} /> TAREAS AUTO-AÑADIDAS</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {result.tareasSugeridas?.map((t, i) => (
                                                <div key={i} style={{ background: 'var(--color-surface-2)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                                                    {t.texto || t}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={14} /> NOTAS AÑADIDAS</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {result.notasSugeridas?.map((n, i) => (
                                                <div key={i} style={{ background: 'var(--color-surface-2)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                                                    <strong>{n.titulo}</strong><br />{n.contenido}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {result.respuestasSugeridas?.length > 0 && (
                                        <div>
                                            <h4 style={{ margin: '0 0 12px 0', fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><MessageSquare size={14} /> RESPUESTAS SUGERIDAS CRM</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {result.respuestasSugeridas.map((r, i) => (
                                                    <div key={i} style={{ background: 'rgba(219, 39, 119, 0.1)', border: '1px solid rgba(219,39,119,0.2)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                                                        <div className="flex-between" style={{ marginBottom: 6 }}>
                                                            <strong style={{ color: '#db2777' }}>{r.leadName}</strong>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(r.mensajeSugerido);
                                                                    toast.success('Copiado al portapapeles');
                                                                }}
                                                                className="btn-icon btn-sm"
                                                            >
                                                                <Copy size={12} />
                                                            </button>
                                                        </div>
                                                        "{r.mensajeSugerido}"
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {result.propuestaDestacada && (
                                        <div>
                                            <h4 style={{ margin: '0 0 12px 0', fontSize: 13, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> PROPUESTA ESTRATÉGICA</h4>
                                            <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', padding: '16px', borderRadius: 12 }}>
                                                <strong style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>{result.propuestaDestacada.titulo}</strong>
                                                <p style={{ fontSize: 13, margin: '8px 0', color: 'var(--text-secondary)' }}>{result.propuestaDestacada.descripcion}</p>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>Valor Sugerido: ${result.propuestaDestacada.valor}</div>
                                            </div>
                                        </div>
                                    )}

                                    <button className="btn btn-ghost" onClick={() => setResult(null)} style={{ marginTop: 10 }}>Analizar de nuevo</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
