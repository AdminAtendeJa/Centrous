import { NavLink } from 'react-router-dom';
import { 
    Grid, CheckSquare, BarChart, MessageCircle, 
    Folder, Database, Users, Link, Settings, Briefcase,
    Zap, Share2, DollarSign
} from 'lucide-react';
import { useAuthStore } from '../../store/index.js';

const NAV_ITEMS = [
    { to: '/dashboard', icon: Grid, label: 'Painel' },
    { to: '/crm', icon: Users, label: 'CRM' },
    { to: '/finance', icon: DollarSign, label: 'Finanças' },
    { to: '/productivity', icon: CheckSquare, label: 'Foco' },
    { type: 'divider' },
    { to: '/inbox', icon: MessageCircle, label: 'Inbox', badge: true },
    { to: '/notion', icon: Folder, label: 'Notion', hideOnMobile: true },
    { to: '/social', icon: Share2, label: 'Social', hideOnMobile: true },
    { to: '/proposals', icon: Briefcase, label: 'Propostas', hideOnMobile: true },
    { type: 'divider' },
    { to: '/n8n', icon: Zap, label: 'Automacão', hideOnMobile: true },
    { to: '/supabase-monitor', icon: Database, label: 'Dados', hideOnMobile: true },
    { to: '/integrations', icon: Link, label: 'Conexões', hideOnMobile: true },
];

export default function Sidebar() {
    const { user } = useAuthStore();
    const initials = user?.email?.substring(0, 2).toUpperCase() || 'US';

    return (
        <aside className="sidebar-v3">
            <div className="logo-v3">Ct</div>

            <nav className="nav-v3">
                {NAV_ITEMS.map((item, idx) => (
                    item.type === 'divider' ? (
                        <div key={`div-${idx}`} className="nav-divider-v3" />
                    ) : (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item-v3 ${isActive ? 'active' : ''} ${item.hideOnMobile ? 'hide-mobile' : ''}`}
                        >
                            <item.icon size={18} strokeWidth={2} />
                            {item.badge && <div className="nav-badge-v3" />}
                            <div className="nav-tooltip-v3">{item.label}</div>
                        </NavLink>
                    )
                ))}
            </nav>

            <div className="sidebar-footer-v3">
                <NavLink to="/settings" className={({ isActive }) => `nav-item-v3 ${isActive ? 'active' : ''}`}>
                    <Settings size={18} strokeWidth={2} />
                    <div className="nav-tooltip-v3">Ajustes</div>
                </NavLink>
                <div className="avatar-v3">
                    {initials}
                    <div className="nav-tooltip-v3">Perfil</div>
                </div>
            </div>
        </aside>
    );
}
