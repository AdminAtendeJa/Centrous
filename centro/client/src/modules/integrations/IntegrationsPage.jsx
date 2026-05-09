import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useIntegrationsStore } from './useIntegrationsStore';
import { INTEGRATION_CATALOG, CATEGORIES } from './integrations.config';
import IntegrationCard from './IntegrationCard';
import ConnectModal from './ConnectModal';
import { Search, Filter } from 'lucide-react';

export default function IntegrationsPage() {
  const { integrations, loading, fetchIntegrations, modalOpen, openModal } = useIntegrationsStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchIntegrations(); }, []);

  const filtered = INTEGRATION_CATALOG.filter(i => {
      const matchesCat = activeCategory === 'all' || i.category === activeCategory;
      const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
  });

  return (
    <div className="integrations-v3 animate-in">
      {/* Header Section */}
      <div className="section-header-v3 mb-8">
        <div>
          <h2 className="section-title-v3">Integration Hub</h2>
          <p className="text-xs text-tertiary">Conecte seus canais e automatize seu fluxo de trabalho.</p>
        </div>
        <div className="flex gap-4">
            <div className="search-trigger-v3">
                <Search size={14} />
                <input 
                    type="text" 
                    placeholder="Buscar ferramentas..." 
                    className="bg-transparent border-none outline-none text-xs ml-2"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-bottom-v3 pb-4">
        <button
          className={`topbar-pill-v3 ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          Todas
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            className={`topbar-pill-v3 ${activeCategory === key ? 'active' : ''}`}
            onClick={() => setActiveCategory(key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="integrations-grid-v3">
        {filtered.map((integration, i) => (
          <IntegrationCard
            key={integration.provider}
            integration={integration}
            credential={integrations.find(c => c.provider === integration.provider)}
            onConnect={() => openModal(integration.provider)}
          />
        ))}
      </div>

      {modalOpen && <ConnectModal />}
    </div>
  );
}
