import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSettingsStore } from '../../store/index.js';
import {
    BarChart2, TrendingUp, Eye, MousePointer, DollarSign,
    Share2, Info, Calendar, Plus, Trash2, MessageCircle, CheckCircle
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';

const REACH_DATA = [
    { day: 'Lun', alcance: 420, clics: 38 },
    { day: 'Mar', alcance: 680, clics: 61 },
    { day: 'Mié', alcance: 540, clics: 45 },
    { day: 'Jue', alcance: 910, clics: 87 },
    { day: 'Vie', alcance: 1240, clics: 112 },
    { day: 'Sáb', alcance: 780, clics: 64 },
    { day: 'Dom', alcance: 430, clics: 29 },
];

const CAMPAIGNS = [
    { id: '1', name: 'Servicios de Automatización', platform: 'Meta', budget: 150, spent: 98, reach: 4200, clicks: 312, cpc: 0.31, status: 'active' },
    { id: '2', name: 'WhatsApp Bot para PYMES', platform: 'Instagram', budget: 80, spent: 80, reach: 2100, clicks: 145, cpc: 0.55, status: 'finished' },
    { id: '3', name: 'Generación de Leads B2B', platform: 'Meta', budget: 200, spent: 65, reach: 1800, clicks: 98, cpc: 0.66, status: 'active' },
];

const CONTENT_PLAN = [
    { id: '1', day: 'Lunes', platform: 'LinkedIn', content: '¿Cuánto tiempo pierdes en tareas repetitivas?', status: 'published' },
    { id: '2', day: 'Miércoles', platform: 'Instagram', content: 'Demo de AtendeJá — bot WhatsApp para tu empresa', status: 'scheduled' },
    { id: '3', day: 'Viernes', platform: 'LinkedIn', content: 'Caso de éxito: +300% velocidad de respuesta a leads', status: 'draft' },
];

const TOOLTIP_STYLE = {
    backgroundColor: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontSize: 12,
};



export default function SocialMedia() {
    const [tab, setTab] = useState('anuncios');
    const { settings } = useSettingsStore();
    const [campaigns, setCampaigns] = useState(CAMPAIGNS);
    const [kpis, setKpis] = useState({ reach: 0, clicks: 0, spent: 0, cpc: 0 });
    const [isDemo, setIsDemo] = useState(true);
    const [loading, setLoading] = useState(true);
    const [contentPlan, setContentPlan] = useState(CONTENT_PLAN);

    useEffect(() => {
        const fetchSocialData = async () => {
            setLoading(true);
            try {
                const res = await axios.get('/api/social/meta/campaigns', {
                    headers: {
                        'x-meta-token': settings.metaToken,
                        'x-meta-app-id': settings.metaAppId
                    }
                });

                if (res.data.success && !res.data.isDemo) {
                    setCampaigns(res.data.data);
                    setIsDemo(false);
                } else {
                    setCampaigns(CAMPAIGNS);
                    setIsDemo(true);
                }

                // Recalcular KPIs basados en las campañas cargadas
                const currentCampaigns = res.data.success && !res.data.isDemo ? res.data.data : CAMPAIGNS;
                const reach = currentCampaigns.reduce((s, c) => s + c.reach, 0);
                const spent = currentCampaigns.reduce((s, c) => s + c.spent, 0);
                const clicks = currentCampaigns.reduce((s, c) => s + c.clicks, 0);
                const cpc = clicks > 0 ? spent / clicks : 0;
                setKpis({ reach, clicks, spent, cpc });

            } catch (err) {
                console.error('Error fetching social:', err);
            }
            setLoading(false);
        };

        fetchSocialData();
    }, [settings.metaToken]);

    const STATUS_MAP = {
        published: { label: 'Publicado', cls: 'badge-success' },
        scheduled: { label: 'Programado', cls: 'badge-primary' },
        draft: { label: 'Borrador', cls: 'badge-muted' },
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1>Redes & Anuncios 📊</h1>
                <p>Estadísticas de campañas y planificador de contenido.</p>
            </div>

            {isDemo ? (
                <div className="demo-banner">
                    <Info size={16} />
                    Datos de demo. Configura tu <strong>Meta Ads Token</strong> en Ajustes para ver datos reales.
                </div>
            ) : (
                <div className="demo-banner" style={{ background: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.2)', color: '#25D366' }}>
                    <CheckCircle size={16} />
                    Conexión establecida con Meta Marketing API. Visualizando datos reales.
                </div>
            )}

            {/* KPI cards */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Alcance Total', value: kpis.reach.toLocaleString(), icon: Eye, color: 'var(--color-primary)' },
                    { label: 'Clics Totales', value: kpis.clicks.toLocaleString(), icon: MousePointer, color: 'var(--color-accent)' },
                    { label: 'Gasto Total', value: `$${kpis.spent}`, icon: DollarSign, color: 'var(--color-warning)' },
                    { label: 'CPC Promedio', value: `$${kpis.cpc.toFixed(2)}`, icon: TrendingUp, color: 'var(--color-success)' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="card flex-center gap-3">
                        <Icon size={22} color={color} style={{ flexShrink: 0 }} />
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2" style={{ marginBottom: 20 }}>
                {['anuncios', 'graficos', 'contenido'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                    >
                        {t === 'anuncios' ? '📣 Campañas' : t === 'graficos' ? '📈 Gráficos' : '📅 Contenido'}
                    </button>
                ))}
            </div>

            {/* Campaings tab */}
            {tab === 'anuncios' && (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Campaña</th>
                                <th>Plataforma</th>
                                <th>Alcance</th>
                                <th>Clics</th>
                                <th>Gasto / Presupuesto</th>
                                <th>CPC</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((c) => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                                    <td>
                                        <span className="badge badge-muted">
                                            <MessageCircle size={11} /> {c.platform}
                                        </span>
                                    </td>
                                    <td>{c.reach.toLocaleString()}</td>
                                    <td>{c.clicks}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ flex: 1, height: 4, background: 'var(--color-surface-3)', borderRadius: 99, overflow: 'hidden' }}>
                                                <div style={{ width: `${(c.spent / c.budget) * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 99 }} />
                                            </div>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>${c.spent}/${c.budget}</span>
                                        </div>
                                    </td>
                                    <td>${c.cpc}</td>
                                    <td>
                                        <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-muted'}`}>
                                            {c.status === 'active' ? 'Activa' : 'Finalizada'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Charts tab */}
            {tab === 'graficos' && (
                <div className="grid-2">
                    <div className="card">
                        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Alcance esta semana</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={REACH_DATA}>
                                <defs>
                                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Area type="monotone" dataKey="alcance" stroke="var(--color-primary)" fill="url(#grad1)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card">
                        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Clics vs Alcance</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={REACH_DATA}>
                                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="alcance" fill="rgba(108,99,255,0.6)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="clics" fill="rgba(0,212,170,0.6)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Content plan tab */}
            {tab === 'contenido' && (
                <div>
                    <div className="flex-between mb-4">
                        <h2 style={{ fontSize: 15, fontWeight: 700 }}>Calendario de Contenido</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {contentPlan.map((post) => {
                            const s = STATUS_MAP[post.status];
                            return (
                                <div key={post.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 18px' }}>
                                    <div style={{ minWidth: 80, fontWeight: 700, fontSize: 13 }}>{post.day}</div>
                                    <span className="badge badge-muted" style={{ flexShrink: 0 }}><MessageCircle size={11} /> {post.platform}</span>
                                    <div style={{ flex: 1, fontSize: 13 }}>{post.content}</div>
                                    <span className={`badge ${s.cls}`}>{s.label}</span>
                                    <button className="btn-icon" onClick={() => setContentPlan((p) => p.filter((x) => x.id !== post.id))}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
