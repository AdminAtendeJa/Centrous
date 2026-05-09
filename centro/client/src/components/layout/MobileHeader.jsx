import { Zap, Bell, User } from 'lucide-react';

export default function MobileHeader() {
    return (
        <header className="mobile-header">
            <div className="mobile-logo">
                <Zap size={20} fill="var(--color-primary)" color="var(--color-primary)" />
                <span>CENTRO<span>US</span></span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                    <Bell size={20} />
                </button>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-glow)', border: '1px solid var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} color="var(--color-primary-light)" />
                </div>
            </div>
        </header>
    );
}
