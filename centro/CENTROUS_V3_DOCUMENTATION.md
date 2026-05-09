# 📚 Documentação Técnica e Funcional: Centrous V3

## 1. Visão Geral
O **Centrous V3** é um ecossistema de gestão empresarial de alta performance (SaaS Dashboard), projetado para centralizar automações, CRM, finanças e produtividade em uma interface única de alta densidade. A arquitetura foi migrada de um modelo tradicional para um sistema de **três painéis (Shell V3)**, otimizando o fluxo de trabalho e a visualização de dados complexos.

---

## 2. Arquitetura do Sistema (Shell V3)
A aplicação utiliza um layout baseado em CSS Grid de três colunas persistentes:

1.  **Sidebar (64px):** Navegação vertical minimalista com foco em ícones e tooltips. Reduz a distração visual e maximiza o espaço de trabalho.
2.  **Main Canvas (Flexível):** Área central de conteúdo onde os módulos residem. Inclui um `TopBar` refinado e um `IntegrationsBar` persistente no rodapé.
3.  **Utility Panel (280px):** Painel lateral direito dedicado a ferramentas contextuais, como o **Groq AI Copilot**, agenda rápida e mensagens.

---

## 3. Stack Tecnológica
*   **Frontend:** React 18, Vite, Framer Motion (animações), Lucide React (ícones), Recharts (gráficos).
*   **Estado Global:** Zustand (Gerenciamento de leads, notas, tarefas e configurações).
*   **Backend:** Node.js + Express 5 (Middleware de segurança e roteamento robusto).
*   **Banco de Dados:** Supabase (PostgreSQL + Auth + Real-time).
*   **IA:** Groq API (Llama 3) / OpenAI (Processamento de linguagem natural e insights).
*   **Automação:** n8n (Engine de workflows externos).

---

## 4. Ecossistema de Conexões e Integrações

### 🔗 n8n Monitor
*   **Função:** Monitoramento e controle de workflows de automação.
*   **Conexão:** Via API Key e URL da instância. Permite ativar/desativar fluxos diretamente do Centrous.
*   **Uso:** Sincronização de leads, notificações de vendas e automação de marketing.

### 📔 Notion Hub
*   **Função:** Espelhamento e edição rápida de páginas e bancos de dados do Notion.
*   **Conexão:** Integração oficial via Notion API Token.
*   **Uso:** Central de documentação e base de conhecimento da empresa.

### 🛡️ Supabase (Backend/DB)
*   **Função:** Fonte da verdade para todos os dados (Leads, Tasks, Finanças).
*   **Real-time:** Utiliza WebSockets para atualização instantânea da interface quando um lead novo entra (via n8n ou formulário).

### 🤖 Groq AI Copilot
*   **Função:** Assistente inteligente integrado.
*   **Uso:** Analisa os dados do CRM e Finanças para sugerir ações (ex: "Sua taxa de conversão caiu, invista mais em Meta Ads").

---

## 5. Detalhamento de Módulos

### 📊 Dashboard Central
*   **KPI Grid:** Cartões de métricas em tempo real (Vendas, Taxa de Conversão, Leads Ativos).
*   **Project Pulse:** Visualização rápida dos projetos e prazos iminentes.

### 👥 CRM Pro (Tabela de Alta Densidade)
*   **Lead Table:** Lista de leads com canais de origem (WhatsApp, Email, Web).
*   **Pipeline Sync:** Integração direta com os valores de venda para alimentar o módulo financeiro.

### 💰 Finanças Corporativas
*   **Cash Flow:** Gráfico de área que projeta receitas vs. despesas.
*   **OpEx Tracker:** Monitoramento de gastos com ferramentas e marketing (SaaS, Ads).

### 🧠 Produtividade (Foco & Notas)
*   **Note Manager:** Grade de notas rápidas para captura de ideias.
*   **Pomodoro V3:** Timer circular integrado para gestão de tempo com modos de trabalho e descanso.

---

## 6. O Plano de Transformação Seguido (Roadmap)

### Fase 1: Fundação e Design System (Concluída)
*   Definição da paleta **Zinc/Slate**.
*   Implementação das variáveis de bordas de `0.5px`.
*   Criação dos tokens de design para alta densidade.

### Fase 2: Rearchitetura de Layout (Concluída)
*   Construção do `app-shell-v3` (Grid 3 colunas).
*   Refatoração do `Sidebar` e `TopBar`.
*   Implementação do `IntegrationsBar`.

### Fase 3: Migração de Módulos Core (Concluída)
*   Transformación del **Dashboard** (Grid estático para dinâmico).
*   Transformación del **CRM** (Kanban para Tabela Pro).
*   Transformación de las **Finanças** (Visualização de fluxo de caixa).

### Fase 4: Refinamento de Utilidades (Concluída)
*   Upgrade del **Notion Hub** e **n8n Monitor**.
*   Redesenho do **Pomodoro** e **Notes**.
*   Criação do novo centro de **Settings**.

---

## 7. Guia de Manutenção e Expansão
1.  **Novos Módulos:** Devem seguir o padrão `section-v3` e `card-v3` definido em `index.css`.
2.  **Segurança:** As rotas do Express utilizam `path-to-regexp` v8 para evitar colisões de rotas dinâmicas.
3.  **Estilos:** Evitar estilos inline; utilizar as classes utilitárias `-v3` para manter a consistência visual.

---
**Documentação gerada por Antigravity AI — Maio 2026**
