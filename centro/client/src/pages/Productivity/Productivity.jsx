import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, Timer, RotateCcw, Play, Pause, Search } from 'lucide-react';
import { useNotesStore } from '../../store/index.js';

function PomodoroV3() {
    const [mode, setMode] = useState('work');
    const [running, setRunning] = useState(false);
    const [seconds, setSeconds] = useState(25 * 60);
    const DURATIONS = { work: 25 * 60, break: 5 * 60 };

    useEffect(() => {
        if (!running) return;
        const t = setInterval(() => {
            setSeconds((s) => {
                if (s <= 1) {
                    clearInterval(t);
                    setRunning(false);
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
        <div className="card-v3 pomodoro-v3">
            <div className="section-header-v3 mb-4">
                <span className="section-title-v3">Foco Pomodoro</span>
                <button className="btn-icon-v3" onClick={() => { setRunning(false); setSeconds(DURATIONS[mode]); }}>
                    <RotateCcw size={12} />
                </button>
            </div>

            <div className="pomo-timer-v3">
                <svg viewBox="0 0 100 100" className="pomo-svg-v3">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border-tertiary)" strokeWidth="4" />
                    <circle
                        cx="50" cy="50" r="45" fill="none"
                        stroke={mode === 'work' ? '#1a1a2e' : '#10b981'}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset={`${283 * (1 - progress / 100)}`}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>
                <div className="pomo-label-v3">
                    <span className="pomo-time-v3">{mins}:{secs}</span>
                    <span className="pomo-mode-v3">{mode.toUpperCase()}</span>
                </div>
            </div>

            <div className="pomo-controls-v3">
                <button className="btn-v3-primary w-full" onClick={() => setRunning((r) => !r)}>
                    {running ? <Pause size={14} /> : <Play size={14} />}
                    {running ? 'Pausar' : 'Iniciar'}
                </button>
                <div className="pomo-modes-v3">
                    <button onClick={() => setMode('work')} className={mode === 'work' ? 'active' : ''}>Foco</button>
                    <button onClick={() => setMode('break')} className={mode === 'break' ? 'active' : ''}>Pausa</button>
                </div>
            </div>
        </div>
    );
}

export default function Productivity() {
    const { notes, addNote, updateNote, deleteNote } = useNotesStore();
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="productivity-v3 animate-in">
            <div className="dashboard-main-v3">
                {/* Notes Section */}
                <div className="section-v3">
                    <div className="toolbar-v3 mb-4">
                        <div className="search-box-v3">
                            <Search size={14} />
                            <input 
                                type="text" 
                                placeholder="Pesquisar notas..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-v3-primary" onClick={() => addNote({ title: 'Nova Nota', content: '' })}>
                            <Plus size={14} /> Nova Nota
                        </button>
                    </div>

                    <div className="notes-grid-v3">
                        {notes.map(note => (
                            <div key={note.id} className="card-v3 note-card-v3">
                                <div className="note-header-v3">
                                    <input 
                                        className="note-title-v3"
                                        value={note.title}
                                        onChange={(e) => updateNote(note.id, { title: e.target.value })}
                                    />
                                    <button className="btn-icon-v3" onClick={() => deleteNote(note.id)}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                <textarea 
                                    className="note-body-v3"
                                    value={note.content}
                                    placeholder="Escreva algo..."
                                    onChange={(e) => updateNote(note.id, { content: e.target.value })}
                                />
                                <div className="note-footer-v3">
                                    Editado {new Date(note.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Side Section */}
                <div className="section-v3">
                    <PomodoroV3 />
                    <div className="card-v3">
                        <span className="section-title-v3 mb-2 block" style={{fontSize: 11}}>Insights de Foco</span>
                        <p style={{fontSize: 10, color: 'var(--color-text-tertiary)', lineHeight: 1.5}}>
                            Você completou 4 ciclos de foco hoje. Seu pico de produtividade foi às 10:30.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
