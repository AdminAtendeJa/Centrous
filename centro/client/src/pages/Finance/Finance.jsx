import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, MoreHorizontal, TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';
import { useCRMStore } from '../../store/index.js';

export default function Finance() {
    const { leads } = useCRMStore();
    const totalWonRevenue = leads.filter(l => l.stage === 'closed_won').reduce((sum, l) => sum + (Number(l.value) || 0), 0);
    const totalExpenses = 420; 
    const netProfit = totalWonRevenue - totalExpenses;

    const stats = [
        { label: 'Lucro Líquido', value: `R$${netProfit.toLocaleString()}`, delta: '↑ 14%', trend: 'up' },
        { label: 'Faturamento', value: `R$${totalWonRevenue.toLocaleString()}`, delta: '↑ 22%', trend: 'up' },
        { label: 'Despesas', value: `R$${totalExpenses.toLocaleString()}`, delta: '↓ 5%', trend: 'up' },
    ];

    const fluxData = [
        { name: 'Seg', ingresos: 400, egresos: 120 },
        { name: 'Ter', ingresos: 700, egresos: 150 },
        { name: 'Qua', ingresos: 500, egresos: 100 },
        { name: 'Qui', ingresos: 900, egresos: 200 },
        { name: 'Sex', ingresos: 1200, egresos: 300 },
    ];

    const transactions = [
        { name: 'Assinatura n8n', date: '05 Mai, 2026', amount: 35, type: 'Expense', status: 'Pago' },
        { name: 'Meta Ads - Campanha A', date: '04 Mai, 2026', amount: 300, type: 'Expense', status: 'Pendente' },
        { name: 'Railway Hosting', date: '02 Mai, 2026', amount: 15, type: 'Expense', status: 'Pago' },
        { name: 'Venda: Acme Corp', date: '01 Mai, 2026', amount: 2500, type: 'Income', status: 'Recebido' },
    ];

    return (
        <div className="finance-v3 animate-in" style={{ padding: '16px' }}>
            {/* Executive Summary */}
            <div className="stat-grid-v3 mb-6 no-padding">
                {stats.map((stat, i) => (
                    <div key={i} className="kpi-card-v3">
                        <div className="kpi-label-v3">{stat.label}</div>
                        <div className="kpi-value-v3">{stat.value}</div>
                        <div className={`kpi-delta-v3 ${stat.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                            {stat.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {stat.delta}
                        </div>
                    </div>
                ))}
            </div>

            {/* Cash Flow Visualizer */}
            <div className="section-v3 mb-6">
                <div className="section-header-v3">
                    <span className="section-title-v3">Projeção de Caixa</span>
                    <button className="btn-v3-secondary" style={{ height: '22px', fontSize: '10px' }}>
                        <Download size={10} /> Exportar CSV
                    </button>
                </div>
                <div className="p-4" style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={fluxData}>
                            <defs>
                                <linearGradient id="colorAccent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" hide />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ 
                                    background: '#fff', 
                                    border: '0.5px solid var(--color-border-tertiary)',
                                    borderRadius: '8px',
                                    fontSize: '10px'
                                }} 
                            />
                            <Area type="monotone" dataKey="ingresos" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorAccent)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Ledger */}
            <div className="table-wrapper">
                <table className="table-v3">
                    <thead>
                        <tr>
                            <th>Transação</th>
                            <th>Data</th>
                            <th>Categoria</th>
                            <th>Status</th>
                            <th className="text-right">Valor</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tr, i) => (
                            <tr key={i}>
                                <td className="font-bold">{tr.name}</td>
                                <td>{tr.date}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        {tr.type === 'Income' ? <Wallet size={12} className="text-success" /> : <CreditCard size={12} className="text-danger" />}
                                        <span className="text-10 font-medium">{tr.type === 'Income' ? 'Entrada' : 'Saída'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`tag-v3 ${tr.status === 'Pago' || tr.status === 'Recebido' ? 'tag-zinc' : 'tag-amber'}`}>
                                        {tr.status}
                                    </span>
                                </td>
                                <td className={`text-right font-bold ${tr.type === 'Income' ? 'text-success' : 'text-primary'}`}>
                                    {tr.type === 'Income' ? '+' : '-'} R${tr.amount.toLocaleString()}
                                </td>
                                <td className="text-right">
                                    <button className="btn-icon-v3">
                                        <MoreHorizontal size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
