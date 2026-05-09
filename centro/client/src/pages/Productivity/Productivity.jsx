import { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCcw, Play, Pause, Search, Clock, Zap } from 'lucide-react';
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
        <div className="card-v3 pomodoro-v3" style={{ textAlign: 'center', background: mode === 'work' ? 'var(--color-accent)' : 'var(--color-success)', color: '#fff', border: 'none' }}>
            <div className="flex-between mb-4">
                <span className="text-10 font-bold uppercase tracking-wider opacity-80">{mode === 'work' ? 'Foco' : 'Pausa'}</span>
                <button className="btn-icon-v3" style={{ color: '#fff' }} onClick={() => { setRunning(false); setSeconds(DURATIONS[mode]); }}>
                    <RotateCcw size={12} />
                </button>
            </div>

            <div className="pomo-timer-v3 mb-6">
                <div className="pomo-time-v3" style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-2px' }}>{mins}:{secs}</div>
            </div>

            <div className="pomo-controls-v3 flex flex-col gap-2">
                <button 
                    className="w-full h-10 rounded-lg bg-white font-bold text-11" 
                    style={{ color: mode === 'work' ? 'var(--color-accent)' : 'var(--color-success)' }}
                    onClick={() => setRunning((r) => !r)}
                >
                    {running ? 'PAUSAR' : 'INICIAR CICLO'}
                </button>
                <div className="flex justify-center gap-4 mt-2">
                    <button onClick={() => setMode('work')} className={`text-10 font-bold opacity-60 ${mode === 'work' ? 'opacity-100 border-b-2 border-white' : ''}`}>Trabalho</button>
                    <button onClick={() => setMode('break')} className={`text-10 font-bold opacity-60 ${mode === 'break' ? 'opacity-100 border-b-2 border-white' : ''}`}>Descanso</button>
                </div>
            </div>
        </div>
    );
}

export default function Productivity() {
    const { notes, addNote, updateNote, deleteNote } = useNotesStore();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredNotes = notes.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="productivity-v3 animate-in" style={{ padding: '16px' }}>
            <div className="dashboard-main-v3" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
                {/* Notes Section */}
                <div className="section-v3">
                    <div className="section-header-v3">
                        <div className="search-box-v3">
                            <Search size={12} />
                            <input 
                                type="text" 
                                placeholder="Pesquisar notas..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-v3-primary" onClick={() => addNote({ title: 'Sem título', content: '' })}>
                            <Plus size={12} /> Nova Nota
                        </button>
                    </div>

                    <div className="p-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                        {filteredNotes.map(note => (
                            <div key={note.id} className="card-v3 note-card-v3 flex flex-col gap-2">
                                <div className="flex-between">
                                    <input 
                                        className="text-13 font-bold text-primary bg-transparent border-none outline-none w-full"
                                        value={note.title}
                                        onChange={(e) => updateNote(note.id, { title: e.target.value })}
                                    />
                                    <button className="btn-icon-v3" onClick={() => deleteNote(note.id)}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                <textarea 
                                    className="text-11 text-secondary bg-transparent border-none outline-none resize-none h-24"
                                    value={note.content}
                                    placeholder="Comece a escrever..."
                                    onChange={(e) => updateNote(note.id, { content: e.target.value })}
                                />
                                <div className="flex-between mt-auto pt-2 border-top-v3">
                                    <span className="text-9 text-tertiary">Editado {new Date(note.updatedAt).toLocaleDateString()}</span>
                                    <Zap size={10} className="text-tertiary" />
                                </div>
                            </div>
                        ))}
                        {filteredNotes.length === 0 && (
                            <div className="p-12 text-center text-tertiary text-11 col-span-full">Nenhuma nota encontrada.</div>
                        )}
                    </div>
                </div>

                {/* Side Section */}
                <div className="flex flex-col gap-4">
                    <PomodoroV3 />
                    <div className="card-v3">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock size={14} className="text-accent" />
                            <span className="text-10 font-bold uppercase text-secondary">Tempo de Foco</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex-between mb-1">
                                    <span className="text-10 text-secondary">Meta diária</span>
                                    <span className="text-10 font-bold">75%</span>
                                </div>
                                <div className="w-full h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                                    <div className="h-full bg-accent" style={{ width: '75%' }} />
                                </div>
                            </div>
                            <p className="text-10 text-tertiary leading-relaxed">
                                Seu pico de produtividade foi identificado entre as **10:00 e 11:30**. 
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
