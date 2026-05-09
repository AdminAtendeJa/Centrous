import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Activity, MoreHorizontal, Download } from 'lucide-react';
import { useCRMStore } from '../../store/index.js';

export default function Finance() {
    const { leads } = useCRMStore();
    const totalWonRevenue = leads.filter(l => l.stage === 'closed_won').reduce((sum, l) => sum + (Number(l.value) || 0), 0);
    const totalExpenses = 420; // Mock
    const netProfit = totalWonRevenue - totalExpenses;

    const stats = [
        { label: 'Lucro Líquido', value: `$${netProfit.toLocaleString()}`, delta: '↑ 14%', trend: 'up' },
        { label: 'Faturamento', value: `$${totalWonRevenue.toLocaleString()}`, delta: '↑ 22%', trend: 'up' },
        { label: 'Gastos OpEx', value: `$${totalExpenses.toLocaleString()}`, delta: '↑ 5%', trend: 'down' },
    ];

    const fluxData = [
        { name: 'Seg', ingresos: 400, egresos: 120 },
        { name: 'Ter', ingresos: 700, egresos: 150 },
        { name: 'Qua', ingresos: 500, egresos: 100 },
        { name: 'Qui', ingresos: 900, egresos: 200 },
        { name: 'Sex', ingresos: 1200, egresos: 300 },
    ];

    const transactions = [
        { name: 'Assinatura n8n', date: '05 Mai, 2026', amount: 35, type: 'Expense', status: 'Paid' },
        { name: 'Meta Ads - Campanha A', date: '04 Mai, 2026', amount: 300, type: 'Expense', status: 'Pending' },
        { name: 'Railway Hosting', date: '02 Mai, 2026', amount: 15, type: 'Expense', status: 'Paid' },
        { name: 'Venda: Acme Corp', date: '01 Mai, 2026', amount: 2500, type: 'Income', status: 'Received' },
    ];

    return (
        <div className="finance-v3 animate-in">
            {/* Stats */}
            <div className="stat-grid-v3 mb-6">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card-v3">
                        <div className="stat-label-v3">{stat.label}</div>
                        <div className="stat-value-v3">{stat.value}</div>
                        <div className={`stat-delta-v3 ${stat.trend}`}>{stat.delta}</div>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="section-v3 mb-8">
                <div className="section-header-v3">
                    <span className="section-title-v3">Fluxo de Caixa</span>
                    <div className="toolbar-actions-v3">
                        <button className="btn-v3-secondary">
                            <Download size={14} /> Exportar
                        </button>
                    </div>
                </div>
                <div className="card-v3" style={{ height: 300, padding: '20px 0 0 0' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={fluxData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                fontSize={10} 
                                tick={{fill: 'var(--color-text-tertiary)'}} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                fontSize={10} 
                                tick={{fill: 'var(--color-text-tertiary)'}}
                                tickFormatter={(v) => `$${v}`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    background: 'var(--color-background-primary)', 
                                    border: '0.5px solid var(--color-border-tertiary)',
                                    borderRadius: '8px',
                                    fontSize: '11px'
                                }} 
                            />
                            <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="section-v3">
                <div className="section-header-v3">
                    <span className="section-title-v3">Transações recentes</span>
                </div>
                <div className="table-wrapper">
                    <table className="table-v3">
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Data</th>
                                <th>Tipo</th>
                                <th>Status</th>
                                <th>Valor</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tr, i) => (
                                <tr key={i}>
                                    <td className="font-medium">{tr.name}</td>
                                    <td>{tr.date}</td>
                                    <td>
                                        <span className={`tag-v3 ${tr.type === 'Income' ? 'tag-green' : 'tag-red'}`}>
                                            {tr.type}
                                        </span>
                                    </td>
                                    <td>{tr.status}</td>
                                    <td className={`font-medium ${tr.type === 'Income' ? 'text-success' : ''}`}>
                                        {tr.type === 'Income' ? '+' : '-'}${tr.amount.toLocaleString()}
                                    </td>
                                    <td>
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
        </div>
    );
}
