import { Search, Bell, Plus, ChevronDown } from 'lucide-react';
import { useAuthStore, useSettingsStore } from '../../store/index.js';
import { useNavigate, useLocation } from 'react-router-dom';

const PAGE_TABS = {
    '/dashboard': [
        { label: 'Visão geral', path: '/dashboard' },
        { label: 'Projetos', path: '/productivity' },
        { label: 'Finanças', path: '/finance' },
    ],
    '/crm': [
        { label: 'Lista', path: '/crm' },
        { label: 'Kanban', path: '/crm' },
    ],
    '/finance': [
        { label: 'Visão geral', path: '/finance' },
        { label: 'CRM', path: '/crm' },
    ],
};

export default function TopBar({ title }) {
    const { user } = useAuthStore();
    const { settings } = useSettingsStore();
    const navigate = useNavigate();
    const location = useLocation();

    const displayName = settings.ownerName || user?.email?.split('@')[0] || 'Usuário';
    const initials = displayName.substring(0, 2).toUpperCase();
    const tabs = PAGE_TABS[location.pathname] || [];

    return (
        <header className="topbar-v3">
            <div className="flex items-center gap-4">
                <span className="text-13 font-bold text-primary uppercase tracking-tight">{title || 'Painel'}</span>
                {tabs.length > 0 && (
                    <div className="flex items-center gap-1 ml-4 hide-mobile">
                        {tabs.map((tab) => (
                            <button
                                key={tab.label}
                                className={`btn-v3-pill ${location.pathname === tab.path && tab.label === tabs[0].label ? 'active' : ''}`}
                                onClick={() => navigate(tab.path)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="search-box-v3 hide-mobile" style={{ width: '240px', height: '30px' }}>
                    <Search size={12} className="text-tertiary" />
                    <input type="text" placeholder="Busca rápida... (⌘K)" className="text-11" />
                </div>

                <div className="h-4 w-px bg-border-tertiary mx-1 hide-mobile" />

                <button className="btn-icon-v3 relative">
                    <Bell size={16} className="text-secondary" />
                    <span style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#ef4444', border: '1.5px solid white'
                    }} />
                </button>

                <div className="flex items-center gap-2 ml-2 cursor-pointer group" onClick={() => navigate('/settings')}>
                    <div className="text-right hide-mobile">
                        <div className="text-10 font-bold text-primary leading-none">{displayName}</div>
                        <div className="text-9 text-tertiary font-medium">ADMIN</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-accent flex-center text-11 font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
}
