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
      {integration.status === 'beta' && (
        <span className="tag-v3 tag-amber mb-2">Beta</span>
      )}
      {integration.status === 'coming_soon' && (
        <span className="tag-v3 tag-zinc mb-2">Em breve</span>
      )}

      {/* Ícone e nome */}
      <div className="flex gap-4 mb-4">
        <div className={`integration-icon-v3 ${isConnected ? 'icon-connected-v3' : ''}`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-primary">{integration.name}</h3>
          <p className="text-[11px] text-tertiary leading-tight">{integration.description}</p>
        </div>
      </div>

      {/* Status de conexão */}
      {isConnected && (
        <div className="connection-meta-v3 mb-4">
          <span className={`status-dot-v3 ${isActive ? 'dot-active-v3' : 'dot-paused-v3'}`} />
          <span className="text-[10px] text-secondary">
            {isActive ? 'Ativo' : 'Pausado'} · {formatDistanceToNow(new Date(credential.connected_at), { locale: ptBR, addSuffix: true })}
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
