import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, CheckSquare, Calendar, MessageCircle, 
    Folder, BarChart2, Users, Plug, Settings, User 
} from 'lucide-react';
import { useAuthStore } from '../../store/index.js';

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Início' },
    { to: '/productivity', icon: CheckSquare, label: 'Tarefas', badge: true },
    { to: '/finance', icon: Calendar, label: 'Agenda' },
    { to: '/inbox', icon: MessageCircle, label: 'Mensagens', badge: true },
    { type: 'divider' },
    { to: '/notion', icon: Folder, label: 'Arquivos' },
    { to: '/social', icon: BarChart2, label: 'Relatórios' },
    { to: '/crm', icon: Users, label: 'Clientes' },
    { to: '/integrations', icon: Plug, label: 'Integrações' },
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
                            className={({ isActive }) => `nav-item-v3 ${isActive ? 'active' : ''}`}
                            title={item.label}
                        >
                            <item.icon size={18} strokeWidth={2} />
                            {item.badge && <div className="nav-badge-v3" />}
                            <div className="nav-tooltip-v3">{item.label}</div>
                        </NavLink>
                    )
                ))}
            </nav>

            <div className="sidebar-footer-v3">
                <NavLink to="/settings" className="nav-item-v3" title="Configurações">
                    <Settings size={18} strokeWidth={2} />
                    <div className="nav-tooltip-v3">Configurações</div>
                </NavLink>
                <div className="avatar-v3" title="Meu perfil">
                    {initials}
                    <div className="nav-tooltip-v3">Meu perfil</div>
                </div>
            </div>
        </aside>
    );
}
