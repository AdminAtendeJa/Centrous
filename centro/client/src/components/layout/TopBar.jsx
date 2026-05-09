import { Search, Bell, Plus, Users } from 'lucide-react';
import { useAuthStore } from '../../store/index.js';

export default function TopBar({ title }) {
    const { user } = useAuthStore();
    const initials = user?.email?.substring(0, 2).toUpperCase() || 'AD';

    return (
        <header className="topbar-v3">
            <div className="flex items-center gap-4">
                <span className="text-13 font-bold text-primary uppercase tracking-tight">{title || 'Painel'}</span>
                <div className="flex items-center gap-1 ml-4">
                    <button className="btn-v3-pill active">Visão geral</button>
                    <button className="btn-v3-pill">Projetos</button>
                    <button className="btn-v3-pill">Finanças</button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="search-box-v3" style={{ width: '240px', height: '30px' }}>
                    <Search size={12} className="text-tertiary" />
                    <input type="text" placeholder="Busca rápida... (⌘K)" className="text-11" />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex-center text-8 font-bold text-white">JP</div>
                        <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex-center text-8 font-bold text-white">MC</div>
                        <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex-center text-8 font-bold text-white">AL</div>
                    </div>
                    <button className="btn-v3-secondary" style={{ height: '26px', padding: '0 10px', fontSize: '10px' }}>
                        <Plus size={10} /> Convidar
                    </button>
                </div>

                <div className="h-4 w-px bg-border-tertiary mx-1" />

                <button className="btn-icon-v3">
                    <Bell size={16} className="text-secondary" />
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
