import { useState, useEffect } from 'react';
import { FileText, Search, ExternalLink, RefreshCw, Info, X, Send, Maximize, Minimize } from 'lucide-react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import { useSettingsStore, useUIStore } from '../../store/index.js';

function NotionDrawer({ page, onClose, initialExpanded = false }) {
    const { settings } = useSettingsStore();
    const setIsDrawerExpanded = useUIStore(s => s.setIsDrawerExpanded);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [editingBlockId, setEditingBlockId] = useState(null);
    const [editDraft, setEditDraft] = useState('');
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    useEffect(() => {
        if (initialExpanded) setIsDrawerExpanded(true);
    }, [initialExpanded]);

    const toggleExpand = () => {
        const next = !isExpanded;
        setIsExpanded(next);
        setIsDrawerExpanded(next);
    };

    const renderBlock = (block) => {
        const getRichText = (arr) => arr?.map((t, i) => <span key={i} style={{ fontWeight: t.annotations?.bold ? 700 : 'normal', fontStyle: t.annotations?.italic ? 'italic' : 'normal', color: t.annotations?.color && t.annotations.color !== 'default' ? t.annotations.color : 'inherit' }}>{t.plain_text}</span>) || [];
        const content = getRichText(block[block.type]?.rich_text);
        const rawText = block[block.type]?.rich_text?.map(t => t.plain_text).join('') || '';

        if (editingBlockId === block.id && block.type === 'paragraph') {
            return (
                <div key={block.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                        autoFocus
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        style={{ flex: 1, padding: '4px 8px', fontSize: 13, border: '1px solid var(--color-primary)' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateBlock(block.id);
                            if (e.key === 'Escape') setEditingBlockId(null);
                        }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => handleUpdateBlock(block.id)} disabled={sending}>✓</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingBlockId(null)}>✕</button>
                </div>
            );
        }

        switch (block.type) {
            case 'paragraph': return (
                <p
                    key={block.id}
                    style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8, minHeight: 16, cursor: 'text', padding: '2px 4px', borderRadius: 4 }}
                    className="hover-bg"
                    onClick={() => { setEditingBlockId(block.id); setEditDraft(rawText); }}
                    title="Clic para editar"
                >
                    {content.length ? content : <span style={{ color: 'var(--text-muted)' }}>¶ (Párrafo vacío)</span>}
                </p>
            );
            case 'heading_1': return <h1 key={block.id} style={{ fontSize: 20, fontWeight: 800, marginTop: 16 }}>{content}</h1>;
            case 'heading_2': return <h2 key={block.id} style={{ fontSize: 17, fontWeight: 700, marginTop: 16 }}>{content}</h2>;
            case 'heading_3': return <h3 key={block.id} style={{ fontSize: 15, fontWeight: 600, marginTop: 16 }}>{content}</h3>;
            case 'bulleted_list_item': return <li key={block.id} style={{ fontSize: 13, marginLeft: 16, marginBottom: 4 }}>{content}</li>;
            case 'numbered_list_item': return <li key={block.id} style={{ fontSize: 13, marginLeft: 16, marginBottom: 4 }}>{content}</li>;
            case 'to_do': return <div key={block.id} style={{ display: 'flex', gap: 8, fontSize: 13, marginBottom: 4, alignItems: 'center' }}><input type="checkbox" checked={block.to_do?.checked || false} readOnly /> <span>{content}</span></div>;
            case 'image':
                const url = block.image?.file?.url || block.image?.external?.url;
                return url ? <img key={block.id} src={url} alt="Notion Image" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }} /> : <div key={block.id}>[Imagen]</div>;
            case 'code': return <pre key={block.id} style={{ background: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 8, fontSize: 12, overflowX: 'auto', marginBottom: 8 }}><code>{content}</code></pre>;
            case 'divider': return <hr key={block.id} style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />;
            default: return <div key={block.id} style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4, fontStyle: 'italic' }}>[Bloque {block.type} no soportado temporalmente]</div>;
        }
    };

    const loadBlocks = async () => {
        try {
            const res = await axios.get(`/api/notion/pages/${page.id}/blocks`, { headers: { 'x-notion-key': settings.notionKey } });
            setBlocks(res.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    useEffect(() => { loadBlocks(); }, [page.id]);

    const handleAppend = async () => {
        if (!draft.trim() || sending) return;
        setSending(true);
        try {
            await axios.patch(`/api/notion/pages/${page.id}/blocks`, { text: draft }, { headers: { 'x-notion-key': settings.notionKey } });
            setDraft('');
            await loadBlocks();
        } catch (e) { alert('Error añadiendo texto'); }
        setSending(false);
    };

    const handleUpdateBlock = async (blockId) => {
        if (!editDraft.trim() || sending) return;
        setSending(true);
        try {
            await axios.patch(`/api/notion/blocks/${blockId}`, { text: editDraft }, { headers: { 'x-notion-key': settings.notionKey } });
            setEditingBlockId(null);
            await loadBlocks(); // Update exact view
        } catch (e) { alert('Error actualizando el bloque de Notion'); }
        setSending(false);
    };

    return createPortal(
        <>
            <style>{`
                .hover-bg:hover { background: rgba(255,255,255,0.05); }
            `}</style>
            <div className="drawer-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.4)' }} />
            <div className={`drawer-right ${isExpanded ? 'drawer-expanded' : ''}`} style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, right: 0, zIndex: 1000, background: 'var(--color-surface)' }}>
                <div className="drawer-header flex-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{page.emoji || '📄'}</span>
                        <div>
                            <h2 style={{ fontSize: 16 }}>{page.title}</h2>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {page.id.split('-')[0]}</span>
                        </div>
                    </div>
                    <div>
                        <a href={page.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ marginRight: 8 }}><ExternalLink size={14} /> Abrir</a>
                        <button onClick={toggleExpand} className="btn-icon" style={{ marginRight: 8 }}>
                            {isExpanded ? <Minimize size={18} /> : <Maximize size={18} />}
                        </button>
                        <button onClick={() => { setIsDrawerExpanded(false); onClose(); }} className="btn-icon"><X size={18} /></button>
                    </div>
                </div>

                <div className="drawer-content" style={{ flex: 1, overflowY: 'auto', padding: 24, paddingBottom: 100 }}>
                    {loading ? (
                        <div className="loading-spinner" style={{ margin: '40px auto' }} />
                    ) : blocks.length === 0 ? (
                        <div className="empty-state">Esta nota está vacía 🤔</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {blocks.map(renderBlock)}
                        </div>
                    )}
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                    <div className="input-group" style={{ display: 'flex', gap: 8 }}>
                        <textarea
                            value={draft} onChange={(e) => setDraft(e.target.value)}
                            placeholder="Añadir una nota rápida al documento..."
                            rows={2} style={{ flex: 1, padding: '10px 14px', borderRadius: 12, resize: 'none' }}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAppend(); } }}
                        />
                        <button onClick={handleAppend} disabled={!draft.trim() || sending} className="btn btn-primary" style={{ padding: '0 24px', borderRadius: 12, flexShrink: 0, fontWeight: 700 }}>
                            {sending ? <RefreshCw size={18} className="spin" /> : 'Añadir a Notion'}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}

const DEMO_PAGES = [
    { id: '1', title: 'Sistema Prompt — AtendeJá', emoji: '🤖', lastEdited: '2026-04-05', type: 'page' },
    { id: '2', title: 'Base de Clientes', emoji: '👥', lastEdited: '2026-04-06', type: 'database' },
    { id: '3', title: 'Pipeline de Ventas', emoji: '💼', lastEdited: '2026-04-07', type: 'database' },
    { id: '4', title: 'Ideas & Servicios', emoji: '💡', lastEdited: '2026-04-04', type: 'page' },
    { id: '5', title: 'Tarifas & Propuestas', emoji: '💰', lastEdited: '2026-04-03', type: 'page' },
    { id: '6', title: 'Reuniones Agendadas', emoji: '📅', lastEdited: '2026-04-07', type: 'database' },
];

export default function NotionHub() {
    const { settings } = useSettingsStore();
    const [pages, setPages] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPage, setSelectedPage] = useState(null);
    const [isInitialExpanded, setIsInitialExpanded] = useState(false);
    const isConnected = !!settings.notionKey;

    const openPage = (page, expanded = false) => {
        const { setIsDrawerExpanded } = useUIStore.getState();
        // Si ya está abierta y llega un doble clic para expandir
        if (selectedPage?.id === page.id && expanded) {
            setIsInitialExpanded(true);
            setIsDrawerExpanded(true);
            return;
        }
        setSelectedPage(page);
        setIsInitialExpanded(expanded);
        if (expanded) setIsDrawerExpanded(true);
    };

    const closePage = () => {
        setSelectedPage(null);
        setIsInitialExpanded(false);
        const { setIsDrawerExpanded } = useUIStore.getState();
        setIsDrawerExpanded(false);
    };

    const fetchPages = async () => {
        if (!isConnected) { setPages(DEMO_PAGES); return; }
        setLoading(true); setError(null);
        try {
            const res = await axios.get('/api/notion/pages', {
                headers: { 'x-notion-key': settings.notionKey }
            });
            setPages(res.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Error al conectar con Notion');
            setPages(DEMO_PAGES);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPages(); }, [isConnected]);

    const filtered = pages.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-in">
            {selectedPage && <NotionDrawer page={selectedPage} onClose={closePage} initialExpanded={isInitialExpanded} />}
            <div className="page-header">
                <h1>Notion Hub 📝</h1>
                <p>Tus páginas y bases de datos de Notion en tiempo real.</p>
            </div>

            {!isConnected && (
                <div className="demo-banner">
                    <Info size={16} />
                    Mostrando datos de demo. Conecta tu Notion API Key en <strong style={{ marginLeft: 4 }}>Ajustes → Integraciones</strong>.
                </div>
            )}

            <div className="flex-between mb-4" style={{ gap: 12 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar páginas…"
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <button className="btn btn-ghost" onClick={fetchPages} disabled={loading}>
                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                    {loading ? 'Cargando…' : 'Actualizar'}
                </button>
                {isConnected && (
                    <a
                        href="https://notion.so"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                    >
                        <ExternalLink size={14} /> Abrir Notion
                    </a>
                )}
            </div>

            {error && (
                <div style={{ background: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16, color: 'var(--color-danger)', fontSize: 13 }}>
                    ⚠️ {error}
                </div>
            )}

            {loading ? (
                <div className="empty-state"><div className="loading-spinner" /><p>Conectando con Notion…</p></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={40} />
                            <h3>Sin resultados</h3>
                            <p>No se encontraron páginas con "{search}"</p>
                        </div>
                    ) : (
                        filtered.map((page) => (
                            <div
                                key={page.id}
                                className="card"
                                draggable={true}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('pageId', page.id);
                                    e.dataTransfer.effectAllowed = 'move';
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    const draggedId = e.dataTransfer.getData('pageId');
                                    if (draggedId === page.id) return;
                                    const oldIndex = pages.findIndex(p => p.id === draggedId);
                                    const newIndex = pages.findIndex(p => p.id === page.id);
                                    const newPages = [...pages];
                                    const [removed] = newPages.splice(oldIndex, 1);
                                    newPages.splice(newIndex, 0, removed);
                                    setPages(newPages);
                                }}
                                onClick={() => openPage(page, false)}
                                onDoubleClick={() => openPage(page, true)}
                                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
                            >
                                <span style={{ fontSize: 22 }}>{page.emoji || '📄'}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{page.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                        Editado: {new Date(page.lastEdited).toLocaleDateString('es')}
                                    </div>
                                </div>
                                <span className={`badge ${page.type === 'database' ? 'badge-primary' : 'badge-muted'}`}>
                                    {page.type === 'database' ? 'Base de datos' : 'Página'}
                                </span>
                                <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
