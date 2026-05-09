import { Bell, Command, Plus, ChevronDown } from 'lucide-react';

export default function TopBar({ title }) {
    return (
        <header className="topbar-v3">
            <div className="topbar-left-v3">
                <span className="view-title-v3">{title}</span>
                <div className="view-badge-v3">LIVE</div>
            </div>

            <div className="topbar-right-v3">
                {/* Search Trigger */}
                <div className="search-trigger-v3">
                    <Command size={14} />
                    <span>Busca rápida...</span>
                    <kbd>⌘K</kbd>
                </div>

                {/* Quick Action Button */}
                <button className="quick-action-btn-v3">
                    <Plus size={14} />
                    <span>Ação Rápida</span>
                    <ChevronDown size={12} />
                </button>

                {/* Notifications */}
                <button className="btn-icon-v3">
                    <Bell size={18} />
                    <div className="notif-dot-v3" />
                </button>

                <div className="topbar-divider-v3" />

                {/* User Avatar */}
                <div className="user-profile-v3">
                    <div className="user-info-v3">
                        <span className="user-name-v3">Victor M.</span>
                        <span className="user-role-v3">Admin</span>
                    </div>
                    <div className="user-avatar-v3">VM</div>
                </div>
            </div>
        </header>
    );
}
