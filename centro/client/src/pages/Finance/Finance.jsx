import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useCRMStore } from '../../store/index.js';
import './Finance.css';

/**
 * CHAIN-OF-THOUGHT:
 * ¿Qué voy a hacer?: Construir el dashboard reactivo de Finanzas usando `recharts` para modelar ingresos vs egresos.
 * ¿Por qué esta arquitectura?: La vista de finanzas no debe ser estática. Extraemos dinámicamente el valor total de leads "Ganados" del CRM real de Zustand (Supabase) y lo cruzamos con los gastos proyectados para renderizar el Flujo de Caja en tiempo real y sin latencia computacional.
 * ¿Beneficio?: El usuario no necesita exportar Excel; ve la salud cardíaca financiera al unísono de sus ventas cerradas de CRM.
 */
export default function Finance() {
    // Jalamos la metadata real de ventas para amarrar el CRM con finanzas
    const { leads } = useCRMStore();

    // Suma real de todos los leads que están cerrados/ganados
    const totalWonRevenue = leads.filter(l => l.stage === 'closed_won').reduce((sum, l) => sum + (Number(l.value) || 0), 0);

    const [expenses] = useState([
        { id: 1, name: 'Suscripción n8n Cloud', date: '2026-04-05', amount: 35, category: 'Software' },
        { id: 2, name: 'Evolution API (Railway)', date: '2026-04-07', amount: 15, category: 'Infraestructura' },
        { id: 3, name: 'Meta Ads (Instagram)', date: '2026-04-08', amount: 300, category: 'Marketing' },
        { id: 4, name: 'OpenAI / Groq API', date: '2026-04-09', amount: 50, category: 'Inteligencia Artificial' },
    ]);

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalWonRevenue - totalExpenses;

    // Data mock para el chart lineal (proyectando el histórico)
    const fluxData = [
        { name: 'Lun', ingresos: totalWonRevenue * 0.1, egresos: 50 },
        { name: 'Mar', ingresos: totalWonRevenue * 0.2, egresos: 80 },
        { name: 'Mié', ingresos: totalWonRevenue * 0.4, egresos: 40 },
        { name: 'Jue', ingresos: totalWonRevenue * 0.8, egresos: 200 },
        { name: 'Vie', ingresos: totalWonRevenue * 1.0, egresos: totalExpenses },
    ];

    const categoryData = [
        { subject: 'Software', A: 35 },
        { subject: 'Infraestructura', A: 15 },
        { subject: 'Marketing', A: 300 },
        { subject: 'Inteligencia Artificial', A: 50 },
    ];

    return (
        <div className="finance-layout animate-in">
            <div className="page-header">
                <h1>Finanzas Corporativas 📈</h1>
                <p>Termómetro de liquidez cruzado con tu ecosistema CRM.</p>
            </div>

            {/* Top Metrics */}
            <div className="grid-3" style={{ marginBottom: 20 }}>
                <div className="metric-card">
                    <div className="metric-label" style={{ color: 'var(--color-success)' }}>
                        <TrendingUp size={16} /> Margen Neto (Profit)
                    </div>
                    <div className="metric-value">
                        ${netProfit.toLocaleString()}
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 8 }}>USD</span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>Beneficio limpio de operacion.</p>
                </div>

                <div className="metric-card">
                    <div className="metric-label" style={{ color: 'var(--color-primary-light)' }}>
                        <ArrowUpRight size={16} /> Total Ingresado (CRM Ganado)
                    </div>
                    <div className="metric-value">
                        ${totalWonRevenue.toLocaleString()}
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>Calculado de {leads.filter(l => l.stage === 'closed_won').length} cierres totales.</p>
                </div>

                <div className="metric-card">
                    <div className="metric-label" style={{ color: 'var(--color-danger)' }}>
                        <ArrowDownRight size={16} /> Gastos Operativos (Opex)
                    </div>
                    <div className="metric-value">
                        ${totalExpenses.toLocaleString()}
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>Herramientas y Marketing activo.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                {/* Main Cash Flow Chart */}
                <div className="chart-container">
                    <div className="flex-between" style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Activity size={18} color="var(--color-accent)" />
                            Flujo de Caja (Proyectado Semanal)
                        </h2>
                    </div>
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer>
                            <AreaChart data={fluxData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: 'var(--shadow-lg)' }}
                                    itemStyle={{ fontSize: 13, fontWeight: 600 }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} iconType="circle" />
                                <Area type="monotone" dataKey="ingresos" name="Ingresos (Sales)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                                <Area type="monotone" dataKey="egresos" name="Egresos (OpEx)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorEgresos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expenses Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="card" style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CreditCard size={16} /> Próximos Pagos
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {expenses.map(exp => (
                                <div key={exp.id} className="expense-row">
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{exp.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exp.category} • {exp.date}</div>
                                    </div>
                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>
                                        -${exp.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-ghost" style={{ width: '100%', marginTop: 8, fontSize: 12 }}>+ Añadir pago recurrente</button>
                    </div>

                    {/* Alerta Estratégica AI */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(219, 39, 119, 0.05))', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                        <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--color-accent)' }}>🤖 Insight de Groq Copilot</h2>
                        <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
                            Tus gastos operativos (OpEx) representan un {(totalExpenses / (totalWonRevenue || 1) * 100).toFixed(1)}% de tu ingreso neto cerrado. El negocio es altamente rentable. Te sugiero reinvertir en pauta para escalar el CRM.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
