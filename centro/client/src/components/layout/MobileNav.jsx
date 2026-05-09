import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Zap, Settings, Inbox } from 'lucide-react';

export default function MobileNav() {
    return (
        <nav className="mobile-nav">
            <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard />
                <span>Panel</span>
            </NavLink>
            <NavLink to="/crm" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Users />
                <span>CRM</span>
            </NavLink>
            <NavLink to="/inbox" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Inbox />
                <span>Mensajes</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Settings />
                <span>Ajustes</span>
            </NavLink>
        </nav>
    );
}
