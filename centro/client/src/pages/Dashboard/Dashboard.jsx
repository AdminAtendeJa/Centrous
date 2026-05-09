import React, { useState } from 'react';
import { 
    TrendingUp, Users, ArrowRight, Plus, 
    CheckCircle2, Clock, PlayCircle, AlertCircle 
} from 'lucide-react';
import { useTasksStore, useCRMStore } from '../../store/index.js';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { tasks, toggleTask } = useTasksStore();
    const { leads } = useCRMStore();
    
    const stats = [
        { label: 'Tarefas concluídas', value: tasks.filter(t => t.done).length, delta: '↑ 3 a mais', trend: 'up' },
        { label: 'Reuniões', value: 4, delta: '↓ 1 a menos', trend: 'down' },
        { label: 'Projetos ativos', value: 3, delta: 'sem alteração', trend: 'neutral' },
    ];

    const todayTasks = tasks.slice(0, 5);

    const getTagClass = (priority) => {
        if (priority === 'high') return 'tag-red';
        if (priority === 'medium') return 'tag-amber';
        return 'tag-blue';
    };

    const getStatusLabel = (done, priority) => {
        if (done) return 'Pronto';
        if (priority === 'high') return 'Atrasado';
        if (priority === 'medium') return 'Urgente';
        return 'Em progresso';
    };

    return (
        <div className="dashboard-v3 animate-in">
            {/* Stats Grid */}
            <div className="section-v3">
                <div className="section-header-v3">
                    <span className="section-title-v3">Esta semana</span>
                    <button className="section-action-v3">
                        Ver tudo <ArrowRight size={11} />
                    </button>
                </div>
                <div className="stat-grid-v3">
                    {stats.map((stat, i) => (
                        <div key={i} className="stat-card-v3">
                            <div className="stat-label-v3">{stat.label}</div>
                            <div className="stat-value-v3">{stat.value}</div>
                            <div className={`stat-delta-v3 ${stat.trend}`}>
                                {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : ''} {stat.delta}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-main-v3">
                {/* Tasks Section */}
                <div className="section-v3 tasks-area-v3">
                    <div className="section-header-v3">
                        <span className="section-title-v3">Tarefas de hoje</span>
                        <button className="section-action-v3">
                            <Plus size={11} /> Nova tarefa
                        </button>
                    </div>
                    <div className="task-list-v3">
                        {todayTasks.length > 0 ? todayTasks.map((task) => (
                            <div key={task.id} className="task-item-v3">
                                <button 
                                    className={`check-circle-v3 ${task.done ? 'done' : ''}`}
                                    onClick={() => toggleTask(task.id)}
                                />
                                <span className={`task-text-v3 ${task.done ? 'done' : ''}`}>
                                    {task.text}
                                </span>
                                <span className={`tag-v3 ${getTagClass(task.priority)}`}>
                                    {getStatusLabel(task.done, task.priority)}
                                </span>
                            </div>
                        )) : (
                            <div className="empty-state-v3">Nenhuma tarefa para hoje</div>
                        )}
                    </div>
                </div>

                {/* Mini Calendar Section */}
                <div className="section-v3 calendar-area-v3">
                    <div className="mini-cal-v3">
                        <div className="cal-header-v3">
                            <span className="cal-month-v3">Maio 2026</span>
                            <div className="cal-nav-v3">
                                <span>‹</span>
                                <span>›</span>
                            </div>
                        </div>
                        <div className="cal-grid-v3">
                            {['D','S','T','Q','Q','S','S'].map(d => (
                                <div key={d} className="cal-day-v3 head">{d}</div>
                            ))}
                            {/* Simple mock calendar days */}
                            {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                                <div 
                                    key={day} 
                                    className={`cal-day-v3 ${day === 9 ? 'today' : ''} ${[1, 5, 8, 12, 17, 24].includes(day) ? 'event' : ''}`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
