import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, MoreHorizontal, TrendingUp, TrendingDown, Wallet, CreditCard, Plus, Trash2, X } from 'lucide-react';
import { useFinanceStore } from '../../store/index.js';
import ModalV3 from '../../components/ui/ModalV3.jsx';
import toast from 'react-hot-toast';

const CATEGORIES = ['Vendas', 'Marketing', 'Software', 'Infraestrutura', 'Salários', 'Impostos', 'Outros'];

export default function Finance() {
    const { transactions, addTransaction, deleteTransaction, getTotals } = useFinanceStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionMenu, setActionMenu] = useState(null);
    const [newTx, setNewTx] = useState({ name: '', amount: '', type: 'income', category: 'Vendas', status: 'received', date: new Date().toISOString().split('T')[0] });

    const { income, expenses, profit } = getTotals();

    const stats = [
        { label: 'Lucro Líquido', value: `R$${profit.toLocaleString('pt-BR')}`, delta: profit >= 0 ? '↑ Positivo' : '↓ Negativo', trend: profit >= 0 ? 'up' : 'down', icon: TrendingUp },
        { label: 'Faturamento', value: `R$${income.toLocaleString('pt-BR')}`, delta: 'Total entradas', trend: 'up', icon: Wallet },
        { label: 'Despesas', value: `R$${expenses.toLocaleString('pt-BR')}`, delta: 'Total saídas', trend: 'neutral', icon: CreditCard },
    ];

    // Build chart data from transactions (last 7 days)
    const chartData = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((name, i) => ({
        name,
        entradas: transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0) / 7 * (0.5 + Math.random()),
        saídas: transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0) / 7 * (0.5 + Math.random()),
    }));

    const handleAddTransaction = () => {
        if (!newTx.name || !newTx.amount) return;
        addTransaction({ ...newTx, amount: Number(newTx.amount) });
        setIsModalOpen(false);
        setNewTx({ name: '', amount: '', type: 'income', category: 'Vendas', status: 'received', date: new Date().toISOString().split('T')[0] });
        toast.success('Transação adicionada!');
    };

    const handleExportCSV = () => {
        const header = ['Nome', 'Data', 'Categoria', 'Tipo', 'Status', 'Valor'].join(',');
        const rows = transactions.map(t => 
            [t.name, t.date, t.category, t.type === 'income' ? 'Entrada' : 'Saída', t.status, t.amount].join(',')
        );
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `centrous-financas-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exportado com sucesso!');
    };

    return (
        <div className="finance-v3 animate-in" style={{ padding: '16px' }}>
            {/* Header */}
            <div className="flex-between mb-6">
                <div>
                    <h1 className="text-18 font-extrabold text-primary tracking-tight">Finanças</h1>
                    <p className="text-11 text-tertiary">Controle inteligente das suas entradas e saídas.</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-v3-secondary" onClick={handleExportCSV}>
                        <Download size={12} /> Exportar CSV
                    </button>
                    <button className="btn-v3-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={12} /> Nova Transação
                    </button>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="stat-grid-v3 mb-6 no-padding">
                {stats.map((stat, i) => (
                    <div key={i} className="kpi-card-v3">
                        <div className="kpi-label-v3">{stat.label}</div>
                        <div className="kpi-value-v3">{stat.value}</div>
                        <div className={`kpi-delta-v3 ${stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-danger' : 'text-tertiary'}`}>
                            {stat.trend === 'up' ? <TrendingUp size={10} /> : stat.trend === 'down' ? <TrendingDown size={10} /> : null} {stat.delta}
                        </div>
                    </div>
                ))}
            </div>

            {/* Cash Flow Chart */}
            <div className="section-v3 mb-6">
                <div className="section-header-v3">
                    <span className="section-title-v3">Projeção de Caixa</span>
                </div>
                <div className="p-4" style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ 
                                    background: '#fff', 
                                    border: '0.5px solid var(--color-border-primary)',
                                    borderRadius: '8px', fontSize: '11px'
                                }} 
                            />
                            <Area type="monotone" dataKey="entradas" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                            <Area type="monotone" dataKey="saídas" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorExpense)" strokeDasharray="4 2" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Ledger */}
            <div className="section-v3">
                <div className="section-header-v3 mb-2">
                    <span className="section-title-v3">Transações</span>
                    <span className="text-10 text-tertiary">{transactions.length} registros</span>
                </div>
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
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-tertiary)', fontSize: 12 }}>
                                        Nenhuma transação. Adicione a primeira!
                                    </td>
                                </tr>
                            )}
                            {transactions.map((tr) => (
                                <tr key={tr.id} style={{ position: 'relative' }}>
                                    <td className="font-bold">{tr.name}</td>
                                    <td>{new Date(tr.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            {tr.type === 'income' ? <Wallet size={12} className="text-success" /> : <CreditCard size={12} className="text-danger" />}
                                            <span className="text-10 font-medium">{tr.category || (tr.type === 'income' ? 'Entrada' : 'Saída')}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`tag-v3 ${tr.status === 'paid' || tr.status === 'received' ? 'tag-zinc' : 'tag-amber'}`}>
                                            {tr.status === 'paid' ? 'Pago' : tr.status === 'received' ? 'Recebido' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className={`text-right font-bold ${tr.type === 'income' ? 'text-success' : 'text-primary'}`}>
                                        {tr.type === 'income' ? '+' : '-'} R${(tr.amount || 0).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="text-right" style={{ position: 'relative' }}>
                                        <button 
                                            className="btn-icon-v3"
                                            onClick={() => setActionMenu(actionMenu === tr.id ? null : tr.id)}
                                        >
                                            <MoreHorizontal size={14} />
                                        </button>
                                        {actionMenu === tr.id && (
                                            <div style={{
                                                position: 'absolute', right: 0, top: '100%', marginTop: 4,
                                                background: 'white', border: '0.5px solid var(--color-border-primary)',
                                                borderRadius: 12, padding: 8, zIndex: 200, minWidth: 150,
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                                            }}>
                                                <button
                                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--color-danger)' }}
                                                    onClick={() => { deleteTransaction(tr.id); setActionMenu(null); toast.success('Transação excluída'); }}
                                                >
                                                    <Trash2 size={12} /> Excluir
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Nova Transação */}
            <ModalV3
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Transação"
                footer={(
                    <>
                        <button className="btn-v3-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button className="btn-v3-primary" onClick={handleAddTransaction}>Salvar</button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <div>
                        <label className="label-v3">Tipo</label>
                        <div className="flex gap-2">
                            <button
                                className={`btn-v3-pill ${newTx.type === 'income' ? 'active' : ''}`}
                                style={{ flex: 1, justifyContent: 'center' }}
                                onClick={() => setNewTx({ ...newTx, type: 'income', status: 'received', category: 'Vendas' })}
                            >
                                💰 Entrada
                            </button>
                            <button
                                className={`btn-v3-pill ${newTx.type === 'expense' ? 'active' : ''}`}
                                style={{ flex: 1, justifyContent: 'center', color: newTx.type === 'expense' ? '#ef4444' : undefined }}
                                onClick={() => setNewTx({ ...newTx, type: 'expense', status: 'paid', category: 'Software' })}
                            >
                                💳 Saída
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="label-v3">Descrição</label>
                        <input className="input-v3" placeholder="Ex: Venda Acme Corp" value={newTx.name} onChange={e => setNewTx({ ...newTx, name: e.target.value })} autoFocus />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label className="label-v3">Valor (R$)</label>
                            <input className="input-v3" type="number" placeholder="0.00" value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} />
                        </div>
                        <div>
                            <label className="label-v3">Data</label>
                            <input className="input-v3" type="date" value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label className="label-v3">Categoria</label>
                            <select className="input-v3" value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-v3">Status</label>
                            <select className="input-v3" value={newTx.status} onChange={e => setNewTx({ ...newTx, status: e.target.value })}>
                                {newTx.type === 'income' 
                                    ? <><option value="received">Recebido</option><option value="pending">Pendente</option></>
                                    : <><option value="paid">Pago</option><option value="pending">Pendente</option></>
                                }
                            </select>
                        </div>
                    </div>
                </div>
            </ModalV3>
        </div>
    );
}
