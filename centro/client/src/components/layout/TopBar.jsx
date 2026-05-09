import { Search, Bell, Plus, Users, PanelRight } from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store/index.js';

export default function TopBar({ title }) {
    const { user } = useAuthStore();
    const { toggleUtility } = useUIStore();
    const initials = user?.email?.substring(0, 2).toUpperCase() || 'AD';

    return (
        <header className="topbar-v3">
            <div className="flex items-center gap-4">
                <span className="text-13 font-bold text-primary uppercase tracking-tight">{title || 'Painel'}</span>
                <div className="flex items-center gap-1 ml-4 hide-mobile">
                    <button className="btn-v3-pill active">Visão geral</button>
                    <button className="btn-v3-pill">Projetos</button>
                    <button className="btn-v3-pill">Finanças</button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="search-box-v3 hide-mobile" style={{ width: '240px', height: '30px' }}>
                    <Search size={12} className="text-tertiary" />
                    <input type="text" placeholder="Busca rápida... (⌘K)" className="text-11" />
                </div>

                <div className="flex items-center gap-2 hide-mobile">
                    <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex-center text-8 font-bold text-white">JP</div>
                        <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex-center text-8 font-bold text-white">MC</div>
                        <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex-center text-8 font-bold text-white">AL</div>
                    </div>
                    <button className="btn-v3-secondary" style={{ height: '26px', padding: '0 10px', fontSize: '10px' }}>
                        <Plus size={10} /> Convidar
                    </button>
                </div>

                <div className="h-4 w-px bg-border-tertiary mx-1 hide-mobile" />

                <button className="btn-icon-v3 hide-mobile">
                    <Bell size={16} className="text-secondary" />
                </button>

                <button className="btn-icon-v3 lg:hidden" onClick={toggleUtility}>
                    <Bell size={18} className="text-accent" />
                </button>

                <div className="flex items-center gap-2 ml-2">
                    <div className="text-right">
                        <div className="text-10 font-bold text-primary leading-none">Victor M.</div>
                        <div className="text-9 text-tertiary font-medium">ADMIN</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-background-tertiary flex-center text-11 font-bold text-secondary border-v3">
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
}
