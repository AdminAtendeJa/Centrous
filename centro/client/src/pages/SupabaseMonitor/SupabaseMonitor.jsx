import React, { useState, useEffect } from 'react';
import { Settings, Zap, Loader2, Database, LayoutDashboard } from 'lucide-react';
import { useSettingsStore, useAuthStore } from '../../store/index.js';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SupabaseMonitor() {
    const { settings } = useSettingsStore();
    const { session } = useAuthStore();
    
    // Config State
    const [sbUrl, setSbUrl] = useState(() => localStorage.getItem('sb_url') || '');
    const [sbKey, setSbKey] = useState(() => localStorage.getItem('sb_key') || '');
    const [isConfigOpen, setIsConfigOpen] = useState(!localStorage.getItem('sb_key'));
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // AI Dashboard Builder State
    const [isBuilding, setIsBuilding] = useState(false);
    const [dashboardConfig, setDashboardConfig] = useState(null);
    const [dynamicData, setDynamicData] = useState({});

    const handleSaveConfig = (e) => {
        e.preventDefault();
        const url = sbUrl.trim().replace(/\/$/, '');
        const key = sbKey.trim();
        if (!key || !url) return;
        localStorage.setItem('sb_url', url);
        localStorage.setItem('sb_key', key);
        setIsConfigOpen(false);
    };

    const buildDashboardWithAI = async () => {
        if (!settings.aiApiKey) {
            toast.error('Configura tu API Key en Ajustes primero');
            return;
        }

        setIsBuilding(true);
        setError('');
        try {
            // 1. Extraer metadata de Supabase
            const metaRes = await axios.post('/api/supabase-meta/meta', {
                url: sbUrl,
                key: sbKey
            }, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            const schema = metaRes.data.schema;

            // 2. Pedirle a Groq que diseñe el Dashboard
            const systemPrompt = `Eres un Ingeniero de Datos y Diseñador UX.
Tu objetivo es leer el esquema de esta base de datos y diseñar un Dashboard analítico útil.
Solo debes proponer métricas y gráficos que tengan sentido comercial basándote en las tablas disponibles.

Regla Estricta: Responde ÚNICA Y EXCLUSIVAMENTE con un JSON válido. No incluyas explicaciones.
Formato:
{
  "titulo": "Resumen General",
  "kpis": [
    { "id": "total_usuarios", "titulo": "Usuarios Registrados", "tabla": "profiles", "operacion": "count" }
  ],
  "graficos": [
    { "id": "usuarios_mes", "titulo": "Usuarios por Mes", "tabla": "profiles", "tipo": "bar", "campoX": "created_at", "campoY": "count" }
  ]
}`;

            const aiRes = await axios.post('/api/ai/groq', {
                systemPrompt,
                businessContext: { schema }
            }, {
                headers: {
                    'x-ai-key': settings.aiApiKey,
                    'x-ai-url': settings.aiBaseUrl,
                    'x-ai-model': settings.aiModel
                }
            });

            let config = aiRes.data.data;
            if (typeof config === 'string') config = JSON.parse(config);
            setDashboardConfig(config);

            // 3. Ejecutar las consultas reales para llenar el dashboard
            await fetchDynamicData(config);
            toast.success('Dashboard construido por IA 🚀');

        } catch (err) {
            console.error(err);
            setError('Error construyendo el dashboard: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsBuilding(false);
        }
    };

    const fetchDynamicData = async (config) => {
        setIsLoading(true);
        const newData = {};
        try {
            // Extraer datos para KPIs y Gráficos
            const queries = [...(config.kpis || []), ...(config.graficos || [])];
            
            for (const q of queries) {
                if (!q.tabla) continue;
                // Esto es una consulta muy simplificada (select * limit 100). En prod sería un RPC complejo o group by.
                const res = await axios.get(`${sbUrl}/rest/v1/${q.tabla}?select=*&limit=100`, {
                    headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}` }
                });
                newData[q.id] = res.data;
            }
            setDynamicData(newData);
        } catch(err) {
            console.error('Error fetching dynamic data', err);
            toast.error('Error obteniendo datos de Supabase');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-in" style={{ paddingBottom: 40 }}>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Supabase Monitor 🗄️</h1>
                    <p>Dashboard dinámico construido por IA leyendo tu propia base de datos.</p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button 
                        className="btn btn-primary" 
                        onClick={buildDashboardWithAI} 
                        disabled={isBuilding || !sbUrl || isConfigOpen}
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', border: 'none', color: '#fff' }}
                    >
                        {isBuilding ? <><Loader2 size={16} className="ai-spin"/> Pensando...</> : <><Zap size={16} /> Generar Dashboard con IA</>}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setIsConfigOpen(true)}>
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            {/* Config Modal */}
            {isConfigOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ maxWidth: 480, width: '90%', textAlign: 'center', padding: 40 }}>
                        <h2 style={{ marginBottom: 8, fontSize: 24, fontWeight: 700 }}>Conectar a Supabase</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Ingresa tu URL y API Key (anon/public) para que la IA lea tu esquema.</p>
                        <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <input
                                value={sbUrl}
                                onChange={e => setSbUrl(e.target.value)}
                                placeholder="https://xyzcompany.supabase.co"
                                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--text)' }}
                            />
                            <input
                                value={sbKey}
                                onChange={e => setSbKey(e.target.value)}
                                placeholder="Tu anon/public key (eyJ...)"
                                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--text)' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '14px', justifyContent: 'center', fontSize: 15 }}>
                                Guardar Credenciales
                            </button>
                            {localStorage.getItem('sb_key') && (
                                <button type="button" className="btn btn-ghost" onClick={() => setIsConfigOpen(false)}>Cancelar</button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {error && (
                <div style={{ padding: 16, background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderRadius: 12, marginBottom: 24, border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!dashboardConfig && !isBuilding && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Database size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                    <h3 style={{ fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>Esperando a la IA...</h3>
                    <p>Haz clic en "Generar Dashboard con IA" para que el Robot analice tus tablas de Supabase y construya gráficos visuales automáticamente.</p>
                </div>
            )}

            {/* Dynamic Dashboard Renderer */}
            {dashboardConfig && (
                <div className="animate-in">
                    <h2 style={{ fontSize: 20, marginBottom: 24 }}>{dashboardConfig.titulo}</h2>
                    
                    {/* KPIs */}
                    {dashboardConfig.kpis && dashboardConfig.kpis.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                            {dashboardConfig.kpis.map((kpi, idx) => (
                                <div key={idx} className="card">
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{kpi.titulo}</div>
                                    <div style={{ fontSize: 32, fontWeight: 800 }}>
                                        {isLoading ? '...' : (dynamicData[kpi.id] ? dynamicData[kpi.id].length : 0)}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--color-primary-light)', marginTop: 8 }}>Tabla: {kpi.tabla}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Charts (Mocked visual representation for now) */}
                    {dashboardConfig.graficos && dashboardConfig.graficos.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
                            {dashboardConfig.graficos.map((graf, idx) => (
                                <div key={idx} className="card" style={{ minHeight: 300, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: 15, marginBottom: 16 }}>{graf.titulo}</h3>
                                    {isLoading ? (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                            <Loader2 className="ai-spin" size={24} />
                                        </div>
                                    ) : (
                                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: 8, display: 'flex', alignItems: 'flex-end', padding: 16, gap: 8 }}>
                                            {/* Fake bar chart representation based on data length */}
                                            {Array.from({length: Math.min(10, Math.max(3, (dynamicData[graf.id]?.length || 0) / 2))}).map((_, i) => (
                                                <div key={i} style={{ 
                                                    flex: 1, 
                                                    background: 'var(--color-primary)', 
                                                    height: \`\${Math.random() * 80 + 20}%\`,
                                                    borderRadius: '4px 4px 0 0',
                                                    opacity: 0.7 + (Math.random() * 0.3)
                                                }} />
                                            ))}
                                            {(dynamicData[graf.id]?.length || 0) === 0 && (
                                                <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)', alignSelf: 'center' }}>
                                                    Sin datos en {graf.tabla}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: \`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .ai-spin { animation: spin 1s linear infinite; }
            \`}} />
        </div>
    );
}
