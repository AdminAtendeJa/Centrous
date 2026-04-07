import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Workflow, BarChart2,
    Users, FileCheck, Brain, Settings, Zap
} from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
    {
        label: 'Principal', items: [
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        ]
    },
    {
        label: 'Herramientas', items: [
            { to: '/notion', icon: FileText, label: 'Notion Hub' },
            { to: '/n8n', icon: Workflow, label: 'n8n Monitor' },
            { to: '/social', icon: BarChart2, label: 'Redes & Anuncios' },
        ]
    },
    {
        label: 'Negocio', items: [
            { to: '/crm', icon: Users, label: 'CRM' },
            { to: '/proposals', icon: FileCheck, label: 'Propuestas' },
        ]
    },
    {
        label: 'Personal', items: [
            { to: '/productivity', icon: Brain, label: 'Productividad' },
            { to: '/settings', icon: Settings, label: 'Ajustes' },
        ]
    },
];

function Clock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <div>
            <div className={styles.sidebarClock}>
                {time.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className={styles.sidebarClockDate}>
                {time.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}
            </div>
        </div>
    );
}

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className={styles.sidebar} style={{ transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {/* Logo */}
            <div className={styles.sidebarLogo}>
                <div className={styles.sidebarLogoIcon}>
                    <Zap size={16} />
                </div>
                <span className={styles.sidebarLogoText}>Centro<span> Pro</span></span>
            </div>

            {/* Nav */}
            <nav className={styles.sidebarNav}>
                {NAV_ITEMS.map((section) => (
                    <div key={section.label}>
                        <div className={styles.navSectionLabel}>{section.label}</div>
                        {section.items.map(({ to, icon: Icon, label, badge }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `${styles.navItem} ${isActive ? styles.active : ''}`
                                }
                            >
                                <Icon size={16} className={styles.navIcon} />
                                {label}
                                {badge && <span className={styles.navBadge}>{badge}</span>}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer Clock */}
            <div className={styles.sidebarFooter}>
                <Clock />
            </div>
        </aside>
    );
}
