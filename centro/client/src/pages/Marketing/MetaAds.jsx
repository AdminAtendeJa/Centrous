import React, { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Zap, Settings, Loader2, BarChart2, DollarSign, Target, Plus } from 'lucide-react';
import { useSettingsStore, useAnalyticsStore } from '../../store/index';
import axios from 'axios';
import toast from 'react-hot-toast';
import ModalV3 from '../../components/ui/ModalV3.jsx';

export default function MetaAds() {
    const { settings } = useSettingsStore();
    const [analyzing, setAnalyzing] = useState(false);
    const [fixing, setFixing] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

    const [campaigns, setCampaigns] = useState([
        { id: 1, name: 'Retargeting Vendas', status: 'active', spend: 450, cpc: 0.45, roas: 3.2, alerts: [], reach: 12400 },
        { id: 2, name: 'Captação Leads Frios', status: 'active', spend: 890, cpc: 1.20, roas: 0.8, alerts: ['Custo por Lead alto', 'Fadiga de anúncio detectada'], reach: 28900 },
        { id: 3, name: 'Lançamento Q3', status: 'paused', spend: 120, cpc: 0.80, roas: 1.5, alerts: [], reach: 4200 },
    ]);

    const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
    const globalRoas = campaigns.reduce((s, c) => s + c.roas, 0) / campaigns.length;
    const campaignsWithAlerts = campaigns.filter(c => c.alerts.length > 0).length;

    const kpis = [
        { label: 'Investimento Total', value: `$${totalSpend.toLocaleString()}`, delta: '↑ 12%', trend: 'up', icon: DollarSign },
        { label: 'ROAS Global', value: `${globalRoas.toFixed(1)}x`, delta: globalRoas >= 2 ? 'Bom desempenho' : '⚠ Abaixo do esperado', trend: globalRoas >= 2 ? 'up' : 'down', icon: TrendingUp },
        { label: 'Alertas de IA', value: String(campaignsWithAlerts), delta: campaignsWithAlerts > 0 ? 'Campanhas precisam de atenção' : 'Tudo OK', trend: campaignsWithAlerts > 0 ? 'down' : 'up', icon: Zap },
    ];

    const handleAnalyze = async (campaign) => {
        if (!settings.aiApiKey) {
            toast.error('Configure sua API Key em Ajustes primeiro');
            return;
        }
        setAnalyzing(true);
        setResult(null);
        setSelectedCampaign(campaign);

        try {
            const systemPrompt = `Você é um Expert em Media Buying e Meta Ads.
Analise a seguinte campanha e retorne um diagnóstico JSON.

REGRA ESTRITA: Responda APENAS JSON.
{
  "diagnostico": "Breve explicação",
  "recomendacao": "O que o usuário deve fazer",
  "acciones_autofix": [
    { "accion": "pause_adset", "descripcion": "Pausar conjuntos com CPA alto" }
  ]
}`;
            const context = {
                campaign,
                globalMetrics: { totalSpend, averageCpc: 0.81, globalRoas }
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
            toast.error('Erro ao analisar a campanha');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAutoFix = async () => {
        if (!result) return;
        setFixing(true);
        await new Promise(r => setTimeout(r, 2000));
        setCampaigns(prev => prev.map(c =>
            c.id === result.campaignId ? { ...c, cpc: +(c.cpc * 0.8).toFixed(2), roas: +(c.roas * 1.5).toFixed(1), alerts: [] } : c
        ));
        toast.success('Mudanças aplicadas com Auto-Pilot 🚀');
        setFixing(false);
        setResult(null);
    };

    return (
        <div className="animate-in" style={{ padding: '16px', paddingBottom: 40 }}>
            {/* Header */}
            <div className="flex-between mb-6">
                <div>
                    <h1 className="text-18 font-extrabold text-primary tracking-tight">Meta Ads & Auto-Pilot</h1>
                    <p className="text-11 text-tertiary">Otimize suas campanhas automaticamente com Inteligência Artificial.</p>
                </div>
                <button className="btn-v3-secondary" onClick={() => setIsConnectModalOpen(true)}>
                    <Settings size={14} /> Conectar Business Manager
                </button>
            </div>

            {/* KPIs */}
            <div className="stat-grid-v3 mb-6 no-padding">
                {kpis.map((kpi, i) => (
                    <div key={i} className="kpi-card-v3">
                        <div className="kpi-label-v3">{kpi.label}</div>
                        <div className="kpi-value-v3">{kpi.value}</div>
                        <div className={`kpi-delta-v3 ${kpi.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                            {kpi.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {kpi.delta}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                {/* Campaigns Table */}
                <div className="section-v3">
                    <div className="section-header-v3 mb-4">
                        <span className="section-title-v3">Campanhas Ativas</span>
                        <button className="btn-v3-primary" style={{ height: 28, fontSize: 11 }}>
                            <Plus size={11} /> Nova Campanha
                        </button>
                    </div>
                    <div className="table-wrapper">
                        <table className="table-v3">
                            <thead>
                                <tr>
                                    <th>Campanha</th>
                                    <th>Status</th>
                                    <th>Gasto</th>
                                    <th>ROAS</th>
                                    <th>CPC</th>
                                    <th>Ação IA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div>
                                                <div className="font-bold text-primary text-12">{c.name}</div>
                                                {c.alerts.length > 0 && (
                                                    <div className="flex items-center gap-1 mt-1" style={{ color: 'var(--color-danger, #ef4444)', fontSize: 10 }}>
                                                        <AlertTriangle size={10} /> {c.alerts[0]}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`tag-v3 ${c.status === 'active' ? 'tag-green' : 'tag-zinc'}`}>
                                                {c.status === 'active' ? 'Ativa' : 'Pausada'}
                                            </span>
                                        </td>
                                        <td className="font-bold">${c.spend}</td>
                                        <td>
                                            <span style={{ fontWeight: 700, color: c.roas < 1 ? 'var(--color-danger, #ef4444)' : 'var(--color-success, #10b981)' }}>
                                                {c.roas}x
                                            </span>
                                        </td>
                                        <td>${c.cpc}</td>
                                        <td>
                                            <button 
                                                className="btn-v3-primary"
                                                style={{ height: 26, fontSize: 10, padding: '0 10px', background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
                                                onClick={() => handleAnalyze(c)}
                                                disabled={analyzing}
                                            >
                                                <Zap size={11} /> Analisar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Diagnosis Panel */}
                <div className="section-v3" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.04), rgba(219, 39, 119, 0.04))', borderColor: 'rgba(124, 58, 237, 0.2)' }}>
                    <div className="section-header-v3 mb-4">
                        <div className="flex items-center gap-2">
                            <Zap size={16} style={{ color: '#db2777' }} />
                            <span className="section-title-v3">Diagnóstico IA</span>
                        </div>
                    </div>

                    {!result && !analyzing && (
                        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-tertiary)' }}>
                            <Activity size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                            <p className="text-11">Selecione uma campanha e clique em <strong>Analisar</strong> para obter recomendações.</p>
                        </div>
                    )}

                    {analyzing && (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <Loader2 size={28} style={{ margin: '0 auto 12px', color: '#7c3aed', animation: 'spin 1s linear infinite' }} />
                            <p className="text-11 text-tertiary">Analisando métricas e lances...</p>
                        </div>
                    )}

                    {result && (
                        <div className="flex flex-col gap-4 animate-in">
                            {selectedCampaign && (
                                <div className="text-10 font-bold text-tertiary uppercase tracking-wider">
                                    Campanha: {selectedCampaign.name}
                                </div>
                            )}
                            <div style={{ background: 'var(--color-accent-light)', padding: 16, borderRadius: 12, border: '0.5px solid var(--color-accent)' }}>
                                <strong className="text-10 uppercase text-accent block mb-2">Diagnóstico</strong>
                                <p className="text-11 leading-relaxed">{result.data.diagnostico}</p>
                            </div>
                            <div style={{ background: 'var(--color-background-secondary)', padding: 16, borderRadius: 12 }}>
                                <strong className="text-10 uppercase text-secondary block mb-2">Recomendação</strong>
                                <p className="text-11 leading-relaxed">{result.data.recomendacao}</p>
                            </div>
                            
                            {result.data.acciones_autofix?.length > 0 && (
                                <div style={{ background: 'rgba(251, 191, 36, 0.08)', padding: 16, borderRadius: 12, border: '0.5px solid rgba(251,191,36,0.3)' }}>
                                    <strong className="text-10 uppercase flex items-center gap-2 mb-3" style={{ color: '#d97706' }}>
                                        <Zap size={12} /> Ações Auto-Fix Disponíveis
                                    </strong>
                                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {result.data.acciones_autofix.map((a, i) => (
                                            <li key={i} className="text-secondary">{a.descripcion}</li>
                                        ))}
                                    </ul>
                                    <button 
                                        className="btn-v3-primary w-full"
                                        style={{ marginTop: 16, height: 36, background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                                        onClick={handleAutoFix}
                                        disabled={fixing}
                                    >
                                        {fixing 
                                            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Aplicando...</>
                                            : <><CheckCircle2 size={14} /> Aplicar Auto-Fix</>
                                        }
                                    </button>
                                </div>
                            )}

                            <button className="btn-v3-ghost w-full text-11" onClick={() => setResult(null)}>
                                Nova análise
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Connect Modal */}
            <ModalV3
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                title="Conectar Meta Business Manager"
                footer={(
                    <>
                        <button className="btn-v3-ghost" onClick={() => setIsConnectModalOpen(false)}>Cancelar</button>
                        <button className="btn-v3-primary" onClick={() => { setIsConnectModalOpen(false); toast.success('Configure o token em Ajustes → Marketing Hub'); }}>
                            Ir para Ajustes
                        </button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <div style={{ background: 'var(--color-background-secondary)', padding: 16, borderRadius: 12 }}>
                        <p className="text-12 text-secondary leading-relaxed">
                            Para conectar o Meta Business Manager, configure seu <strong>Meta Access Token</strong> em <strong>Ajustes → Marketing Hub</strong>.
                        </p>
                    </div>
                    <p className="text-11 text-tertiary">
                        Após configurar, o Centrous poderá ler métricas reais de suas campanhas via Meta Graph API.
                    </p>
                </div>
            </ModalV3>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}
