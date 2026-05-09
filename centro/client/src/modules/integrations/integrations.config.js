export const INTEGRATION_CATALOG = [
  {
    provider: 'whatsapp_360dialog',
    name: 'WhatsApp Business',
    description: 'Receba e envie mensagens via 360dialog',
    category: 'messaging',
    icon: 'MessageSquare',
    status: 'available',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: true },
      { key: 'phone_number', label: 'Número (E.164)', type: 'text',
        placeholder: '+5548999999999', required: true, isMetadata: true }
    ]
  },
  {
    provider: 'email_smtp',
    name: 'Email SMTP',
    description: 'Qualquer provedor via SMTP/IMAP',
    category: 'messaging',
    icon: 'Mail',
    status: 'available',
    fields: [
      { key: 'smtp_host', label: 'Host SMTP', type: 'text', required: true },
      { key: 'smtp_port', label: 'Porta', type: 'number', default: 587 },
      { key: 'smtp_user', label: 'Usuário', type: 'text', required: true },
      { key: 'smtp_pass', label: 'Senha', type: 'password', required: true },
    ]
  },
  {
    provider: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sincronize agenda e reuniões',
    category: 'productivity',
    icon: 'Calendar',
    status: 'available',
    authType: 'oauth'
  },
  {
    provider: 'stripe',
    name: 'Stripe',
    description: 'Receba pagamentos e acompanhe receita',
    category: 'finance',
    icon: 'CreditCard',
    status: 'available',
    fields: [
      { key: 'secret_key', label: 'Secret Key', type: 'password', required: true },
      { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: true }
    ]
  },
  {
    provider: 'n8n',
    name: 'n8n Workflows',
    description: 'Engine de automação avançada',
    category: 'automation',
    icon: 'Zap',
    status: 'available',
    fields: [
      { key: 'base_url', label: 'URL da instância', type: 'text', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', required: true }
    ]
  }
];

export const CATEGORIES = {
  messaging:    { label: 'Mensageria',    icon: 'MessageSquare' },
  finance:      { label: 'Financeiro',    icon: 'DollarSign' },
  productivity: { label: 'Produtividade', icon: 'Zap' },
  automation:   { label: 'Automação',     icon: 'Workflow' }
};
