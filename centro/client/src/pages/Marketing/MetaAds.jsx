import React, { useState } from 'react';
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, Zap, Settings, ArrowRight, Loader2 } from 'lucide-react';
import { useSettingsStore, useAnalyticsStore } from '../../store/index';
import axios from 'axios';
import toast from 'react-hot-toast';
import './MetaAds.css';

export default function MetaAds() {
    const { settings } = useSettingsStore();
    const [analyzing, setAnalyzing] = useState(false);
    const [fixing, setFixing] = useState(false);
    const [result, setResult] = useState(null);

    // Mock data for campaigns
    const [campaigns, setCampaigns] = useState([
        { id: 1, name: 'Retargeting Ventas', status: 'active', spend: 450, cpc: 0.45, roas: 3.2, alerts: [] },
        { id: 2, name: 'Captación Leads Frios', status: 'active', spend: 890, cpc: 1.20, roas: 0.8, alerts: ['Costo por Lead alto', 'Fatiga de anuncio detectada'] },
        { id: 3, name: 'Lanzamiento Q3', status: 'paused', spend: 120, cpc: 0.80, roas: 1.5, alerts: [] }
    ]);

    const handleAnalyze = async (campaign) => {
        if (!settings.aiApiKey) {
            toast.error('Configura tu API Key en Ajustes primero');
            return;
        }

        setAnalyzing(true);
        setResult(null);

        try {
            const systemPrompt = `Eres un Experto en Media Buying y Meta Ads.
Analiza la siguiente campaña publicitaria y devuelve un diagnóstico JSON.
Si detectas problemas, sugiere acciones de Auto-Fix que puedas ejecutar.

REGLA ESTRICTA: Responde SÓLO JSON.
{
  "diagnostico": "Breve explicación de qué está pasando con la campaña",
  "recomendacion": "Qué debería hacer el usuario",
  "acciones_autofix": [
    { "accion": "pause_adset", "descripcion": "Pausar conjuntos de anuncios con CPA alto" },
    { "accion": "duplicate_campaign", "descripcion": "Duplicar campaña para reiniciar aprendizaje" }
  ]
}`;
            
            const context = {
                campaign,
                globalMetrics: { totalSpend: 1460, averageCpc: 0.81, globalRoas: 1.8 }
            };

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

            setResult({ campaignId: campaign.id, data: res.data.data });
        } catch (err) {
            console.error(err);
            toast.error('Error analizando la campaña');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAutoFix = async () => {
        if (!result || !result.data.acciones_autofix) return;
        
        setFixing(true);
        
        // Simular ejecución de Auto-Fix a través de n8n o Graph API
        await new Promise(r => setTimeout(r, 2000));
        
        // Update local state to reflect changes (mock)
        setCampaigns(prev => prev.map(c => 
            c.id === result.campaignId ? { ...c, cpc: c.cpc * 0.8, roas: c.roas * 1.5, alerts: [] } : c
        ));

        toast.success('Cambios aplicados exitosamente vía Auto-Pilot 🚀');
        setFixing(false);
        setResult(null);
    };

    return (
        <div className="animate-in" style={{ paddingBottom: 40 }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Meta Ads & Auto-Pilot 📈</h1>
                    <p>Optimiza tus campañas automáticamente con Inteligencia Artificial.</p>
                </div>
                <button className="btn btn-ghost"><Settings size={18} /> Conectar Business Manager</button>
            </div>

            <div className="grid-3" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Inversión Total</div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>$1,460</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>ROAS Global</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-success)' }}>1.8x</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Estado de IA</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <div className="ai-pulse" style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: 14, fontWeight: 600 }}>Auto-Pilot Activo</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 20 }}>
                {/* Campaigns List */}
                <div className="card">
                    <h2 style={{ fontSize: 16, marginBottom: 16 }}>Campañas Activas</h2>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: 12 }}>Campaña</th>
                                <th style={{ padding: 12 }}>Estado</th>
                                <th style={{ padding: 12 }}>Gasto</th>
                                <th style={{ padding: 12 }}>ROAS</th>
                                <th style={{ padding: 12 }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: 12 }}>
                                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                                        {c.alerts.length > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-danger)', fontSize: 11, marginTop: 4 }}>
                                                <AlertTriangle size={12} /> {c.alerts[0]}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: 12 }}>
                                        <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: 12 }}>${c.spend}</td>
                                    <td style={{ padding: 12, fontWeight: 700, color: c.roas < 1 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                        {c.roas}x
                                    </td>
                                    <td style={{ padding: 12 }}>
                                        <button 
                                            className="btn btn-sm" 
                                            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', border: 'none', color: '#fff' }}
                                            onClick={() => handleAnalyze(c)}
                                            disabled={analyzing}
                                        >
                                            <Zap size={12} /> Analizar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* AI Analysis Panel */}
                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(219, 39, 119, 0.05))', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Zap size={20} color="#db2777" />
                        <h2 style={{ fontSize: 16, m: 0 }}>Diagnóstico IA</h2>
                    </div>

                    {!result && !analyzing && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '40px 0' }}>
                            <Activity size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p>Selecciona una campaña para analizar su rendimiento y obtener recomendaciones.</p>
                        </div>
                    )}

                    {analyzing && (
                        <div style={{ textAlign: 'center', margin: '40px 0' }}>
                            <Loader2 size={32} className="ai-spin" style={{ margin: '0 auto 12px', color: '#7c3aed' }} />
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Analizando métricas y subastas...</p>
                        </div>
                    )}

                    {result && (
                        <div className="animate-in">
                            <div style={{ marginBottom: 16 }}>
                                <strong style={{ fontSize: 12, color: 'var(--color-accent)', textTransform: 'uppercase' }}>Diagnóstico</strong>
                                <p style={{ fontSize: 13, lineHeight: 1.5, marginTop: 4 }}>{result.data.diagnostico}</p>
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <strong style={{ fontSize: 12, color: 'var(--color-accent)', textTransform: 'uppercase' }}>Recomendación</strong>
                                <p style={{ fontSize: 13, lineHeight: 1.5, marginTop: 4 }}>{result.data.recomendacion}</p>
                            </div>
                            
                            {result.data.acciones_autofix?.length > 0 && (
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <strong style={{ fontSize: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                        <Zap size={14} /> Acciones Auto-Fix Disponibles
                                    </strong>
                                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {result.data.acciones_autofix.map((a, i) => (
                                            <li key={i}>{a.descripcion}</li>
                                        ))}
                                    </ul>
                                    <button 
                                        className="btn btn-primary" 
                                        style={{ width: '100%', marginTop: 16, background: '#22c55e', border: 'none', color: '#000', fontWeight: 700 }}
                                        onClick={handleAutoFix}
                                        disabled={fixing}
                                    >
                                        {fixing ? <><Loader2 size={16} className="ai-spin" /> Aplicando cambios...</> : <><CheckCircle2 size={16} /> Arreglar Automáticamente</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .ai-spin { animation: spin 1s linear infinite; }
            `}} />
        </div>
    );
}
