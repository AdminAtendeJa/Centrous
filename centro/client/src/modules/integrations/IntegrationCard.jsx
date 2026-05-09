import { 
  MessageSquare, 
  Mail, 
  Calendar, 
  CreditCard, 
  Zap, 
  Plug, 
  Trash2,
  DollarSign,
  Workflow,
  Share2
} from 'lucide-react';
import { useIntegrationsStore } from './useIntegrationsStore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ICON_MAP = {
  MessageSquare,
  Mail,
  Calendar,
  CreditCard,
  Zap,
  DollarSign,
  Workflow,
  Share2
};

export default function IntegrationCard({ integration, credential, onConnect }) {
  const { toggleActive, disconnect } = useIntegrationsStore();
  const Icon = ICON_MAP[integration.icon] || Plug;
  const isConnected = !!credential;
  const isActive = credential?.is_active;

  return (
    <div className={`card-v3 integration-card-v3 ${isConnected ? 'card-connected-v3' : ''}`}>
      {/* Badge de status */}
      <div className="flex-between mb-2">
        {integration.status === 'beta' ? (
          <span className="tag-v3 tag-amber">Beta</span>
        ) : integration.status === 'coming_soon' ? (
          <span className="tag-v3 tag-zinc">Em breve</span>
        ) : <div />}
        {isConnected && <span className={`status-dot-v3 ${isActive ? 'dot-active-v3' : 'dot-paused-v3'}`} />}
      </div>

      {/* Ícone e nome */}
      <div className="flex gap-3 mb-4">
        <div className={`integration-icon-v3 ${isConnected ? 'icon-connected-v3' : ''}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-primary truncate">{integration.name}</h3>
          <p className="text-10 text-tertiary leading-tight truncate">{integration.description}</p>
        </div>
      </div>

      {/* Status de conexão */}
      {isConnected && (
        <div className="connection-meta-v3 mb-4">
          <span className="text-10 text-secondary">
             {formatDistanceToNow(new Date(credential.connected_at), { locale: ptBR, addSuffix: true })}
          </span>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-2 mt-auto">
        {!isConnected && integration.status === 'available' && (
          <button className="btn-v3-primary w-full" onClick={onConnect}>
            Conectar
          </button>
        )}
        {isConnected && (
          <>
            <button
              className="btn-v3-secondary flex-1"
              onClick={() => toggleActive(credential.id, isActive)}
            >
              {isActive ? 'Pausar' : 'Ativar'}
            </button>
            <button
              className="btn-icon-v3 text-danger"
              onClick={() => {
                  if(window.confirm('Desconectar esta integração?')) disconnect(credential.id);
              }}
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
        {integration.status === 'coming_soon' && (
          <button className="btn-v3-secondary w-full" disabled>
            Em breve
          </button>
        )}
      </div>
    </div>
  );
}
