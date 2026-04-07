import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit3, Save, X, Timer, RotateCcw, Play, Pause } from 'lucide-react';
import { useNotesStore } from '../../store/index.js';

// ── Pomodoro ──────────────────────────────────────────────────────────────────
function Pomodoro() {
    const [mode, setMode] = useState('work'); // work | break
    const [running, setRunning] = useState(false);
    const [seconds, setSeconds] = useState(25 * 60);
    const [sessions, setSessions] = useState(0);
    const DURATIONS = { work: 25 * 60, break: 5 * 60 };

    useEffect(() => {
        if (!running) return;
        const t = setInterval(() => {
            setSeconds((s) => {
                if (s <= 1) {
                    clearInterval(t);
                    setRunning(false);
                    if (mode === 'work') setSessions((prev) => prev + 1);
                    const next = mode === 'work' ? 'break' : 'work';
                    setMode(next);
                    setSeconds(DURATIONS[next]);
                    return DURATIONS[next];
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [running, mode]);

    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    const progress = (1 - seconds / DURATIONS[mode]) * 100;

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                <Timer size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Pomodoro
            </h2>
            <div className="flex gap-2" style={{ marginBottom: 20 }}>
                {['work', 'break'].map((m) => (
                    <button
                        key={m}
                        onClick={() => { setRunning(false); setMode(m); setSeconds(DURATIONS[m]); }}
                        className={`btn btn-sm ${mode === m ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        {m === 'work' ? '🎯 Trabajo' : '☕ Descanso'}
                    </button>
                ))}
            </div>

            {/* Circle progress */}
            <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 20 }}>
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-surface-3)" strokeWidth="8" />
                    <circle
                        cx="50" cy="50" r="45" fill="none"
                        stroke={mode === 'work' ? 'var(--color-primary)' : 'var(--color-accent)'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{mins}:{secs}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{mode === 'work' ? 'TRABAJANDO' : 'DESCANSANDO'}</div>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="btn btn-primary" onClick={() => setRunning((r) => !r)}>
                    {running ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> {seconds === DURATIONS[mode] ? 'Iniciar' : 'Continuar'}</>}
                </button>
                <button className="btn btn-ghost" onClick={() => { setRunning(false); setSeconds(DURATIONS[mode]); }}>
                    <RotateCcw size={14} />
                </button>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                🏅 {sessions} sesión{sessions !== 1 ? 'es' : ''} completada{sessions !== 1 ? 's' : ''} hoy
            </div>
        </div>
    );
}

// ── Notes ─────────────────────────────────────────────────────────────────────
export default function Productivity() {
    const { notes, addNote, updateNote, deleteNote } = useNotesStore();
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [creating, setCreating] = useState(false);

    const startEdit = (note) => {
        setEditingId(note.id);
        setEditTitle(note.title);
        setEditContent(note.content);
    };

    const saveEdit = () => {
        updateNote(editingId, { title: editTitle, content: editContent });
        setEditingId(null);
    };

    const handleCreate = () => {
        if (!newTitle.trim()) return;
        addNote({ title: newTitle, content: '' });
        setNewTitle('');
        setCreating(false);
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1>Productividad 🧠</h1>
                <p>Notas rápidas y Pomodoro para mantener el foco.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
                {/* Notes */}
                <div>
                    <div className="flex-between mb-4">
                        <h2 style={{ fontSize: 15, fontWeight: 700 }}>Quick Notes</h2>
                        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
                            <Plus size={14} /> Nueva nota
                        </button>
                    </div>

                    {creating && (
                        <div className="card" style={{ marginBottom: 12 }}>
                            <input
                                autoFocus
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Título de la nota…"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                style={{ marginBottom: 8 }}
                            />
                            <div className="flex gap-2">
                                <button className="btn btn-primary btn-sm" onClick={handleCreate}><Save size={13} /> Crear</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setCreating(false)}><X size={13} /></button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {notes.length === 0 && (
                            <div className="empty-state"><p>Sin notas. Crea una para comenzar.</p></div>
                        )}
                        {notes.map((note) => (
                            <div key={note.id} className="card">
                                {editingId === note.id ? (
                                    <>
                                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ marginBottom: 8, fontWeight: 700 }} />
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            rows={5}
                                            style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7 }}
                                            placeholder="Escribe tu nota en Markdown…"
                                        />
                                        <div className="flex gap-2" style={{ marginTop: 10 }}>
                                            <button className="btn btn-primary btn-sm" onClick={saveEdit}><Save size={13} /> Guardar</button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}><X size={13} /></button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-between" style={{ marginBottom: 8 }}>
                                            <h3 style={{ fontSize: 14, fontWeight: 700 }}>{note.title}</h3>
                                            <div className="flex gap-1">
                                                <button className="btn-icon" style={{ padding: 4 }} onClick={() => startEdit(note)}><Edit3 size={13} /></button>
                                                <button className="btn-icon" style={{ padding: 4 }} onClick={() => deleteNote(note.id)}><Trash2 size={13} /></button>
                                            </div>
                                        </div>
                                        {note.content ? (
                                            <pre style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7 }}>{note.content}</pre>
                                        ) : (
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nota vacía — haz clic en editar</span>
                                        )}
                                        <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
                                            Actualizado: {new Date(note.updatedAt).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pomodoro */}
                <div>
                    <Pomodoro />
                </div>
            </div>
        </div>
    );
}
