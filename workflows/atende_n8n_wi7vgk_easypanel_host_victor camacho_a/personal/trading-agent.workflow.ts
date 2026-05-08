import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Trading Agent
// Nodes   : 16  |  Connections: 6
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// ScheduleTrigger                    scheduleTrigger
// ForexData                          httpRequest
// DataPreparer                       code
// AiAgent                            agent                      [AI]
// WhatsappAlert                      evolutionApi               [creds]
// MarketNews                         httpRequestTool            [ai_tool]
// EconomicCalendar                   httpRequestTool            [ai_tool]
// GroqChatModel                      lmChatGroq                 [creds] [ai_languageModel]
// SimpleMemory                       memoryBufferWindow         [ai_memory]
// OpenaiEmbeddings                   embeddingsOpenAi           [creds] [ai_embedding]
// VectorStoreRetrieve                vectorStoreInMemory        [AI] [ai_vectorStore]
// RetrieverVectorStore               retrieverVectorStore       [AI] [ai_retriever]
// ManualDocumentsUpload              manualTrigger
// DataLoader                         documentDefaultDataLoader
// TextSplitter                       textSplitterRecursiveCharacterTextSplitter
// VectorStoreIngest                  vectorStoreInMemory
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// ScheduleTrigger
//    → ForexData
//      → DataPreparer
//        → AiAgent
//          → WhatsappAlert
// ManualDocumentsUpload
//    → DataLoader
//      → VectorStoreIngest
//
// AI CONNECTIONS
// AiAgent.uses({ ai_languageModel: GroqChatModel, ai_memory: SimpleMemory, ai_retriever: RetrieverVectorStore, ai_tool: [MarketNews, EconomicCalendar] })
// VectorStoreRetrieve.uses({ ai_embedding: OpenaiEmbeddings })
// RetrieverVectorStore.uses({ ai_vectorStore: VectorStoreRetrieve })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'n4jYAxmvqhB3bajA',
    name: 'Trading Agent',
    active: false,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner', availableInMCP: false },
})
export class TradingAgentWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'f7b49383-4796-4123-a303-bf812bce9747',
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.1,
        position: [1200, 500],
    })
    ScheduleTrigger = {
        rule: {
            interval: [
                {
                    field: 'minutes',
                    minutesInterval: 30,
                },
            ],
        },
    };

    @node({
        id: '15dc158b-ea6c-490c-9ab2-209c6ae5f672',
        name: 'Forex Data',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [1400, 500],
    })
    ForexData = {
        url: 'https://open.er-api.com/v6/latest/USD',
        method: 'GET',
        options: {},
    };

    @node({
        id: '3fd6eb92-f6aa-41fe-8010-06002ba2ee40',
        name: 'Data Preparer',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1600, 500],
    })
    DataPreparer = {
        jsCode: `const data = $input.first().json;
const rates = data.rates;
const focusPairs = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'];
let summary = "Base Currency: USD\\n";

focusPairs.forEach(pair => {
    if (rates[pair]) {
        summary += "- USD/" + pair + ": " + rates[pair] + "\\n";
    }
});

return {
    marketSummary: summary,
    fechaHora: new Date().toISOString()
};`,
    };

    @node({
        id: 'b9ad92d1-169a-4949-bb49-a8c0925c1661',
        name: 'AI Agent',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 3.1,
        position: [1800, 500],
    })
    AiAgent = {
        options: {
            systemMessage: `Eres un Analista Experto en Trading de FOREX de nivel Institucional.
Tu objetivo es realizar una INVESTIGACIÓN COMPLETA antes de identificar oportunidades de inversión.

Proceso de Trabajo:
1. **Investigar**: Consulta el Calendario Económico para ver eventos de alto impacto y las Noticias de Mercado para el sentimiento actual.
2. **Consultar Conocimiento**: Si necesitas recordar estrategias específicas del usuario, usa el Retriever.
3. **Analizar**: Cruza los datos de tasas de cambio (Base USD) con los hallazgos de investigación.
4. **Reportar**: Genera un reporte premium para WhatsApp.

Contexto Inicial:
- Fecha y hora: {{ $json.fechaHora }}
- Tasas de Cambio: {{ $json.marketSummary }}

Instrucciones:
- Usa negritas y emojis.
- Identifica oportunidades claras o recomienda precaución si hay noticias de alto impacto pronto.
- NO des consejos financieros legales.`,
        },
    };

    @node({
        id: '6895ec0c-0fe6-4575-a831-d920e606bb26',
        name: 'WhatsApp Alert',
        type: 'n8n-nodes-evolution-api.evolutionApi',
        version: 1,
        position: [2100, 500],
        credentials: { evolutionApi: { id: 'dhZcAfk3MJMwaSHT', name: 'Evolution account' } },
    })
    WhatsappAlert = {
        resource: 'messages-api',
        instanceName: 'AtendeJa',
        remoteJid: '554884553306@s.whatsapp.net',
        messageText: '={{ $json.output }}',
        options_message: {},
    };

    @node({
        id: 'scraper-news-id',
        name: 'Market News',
        type: 'n8n-nodes-base.httpRequestTool',
        version: 4.4,
        position: [1600, 700],
    })
    MarketNews = {
        url: 'https://www.dailyfx.com/feeds/market-news',
        method: 'GET',
        toolDescription:
            'Usa esta herramienta para obtener las noticias más recientes y el sentimiento del mercado Forex.',
        responseType: 'text',
    };

    @node({
        id: 'economic-calendar-id',
        name: 'Economic Calendar',
        type: 'n8n-nodes-base.httpRequestTool',
        version: 4.4,
        position: [1750, 700],
    })
    EconomicCalendar = {
        url: 'https://tradingeconomics.com/rss/calendar.aspx',
        method: 'GET',
        toolDescription:
            'Usa esta herramienta para consultar el calendario económico y eventos de alto impacto para las divisas.',
        responseType: 'text',
    };

    @node({
        id: '94a745f1-4819-443b-81bb-65c11f70bfbc',
        name: 'Groq Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatGroq',
        version: 1,
        position: [1800, 700],
        credentials: { groqApi: { id: 'ajcc5lsup6acbPrm', name: 'Groq audio whisper' } },
    })
    GroqChatModel = {
        model: 'llama-3.3-70b-versatile',
        options: {},
    };

    @node({
        id: '507fa5af-5425-47e1-bf90-776012928d9a',
        name: 'Simple Memory',
        type: '@n8n/n8n-nodes-langchain.memoryBufferWindow',
        version: 1.3,
        position: [1950, 700],
    })
    SimpleMemory = {
        sessionIdType: 'customKey',
        sessionKey: 'trading_agent_forex_v2',
        contextWindowLength: 10,
    };

    @node({
        id: 'openai-embedding-id',
        name: 'OpenAI Embeddings',
        type: '@n8n/n8n-nodes-langchain.embeddingsOpenAi',
        version: 1.2,
        position: [1400, 900],
        credentials: { openAiApi: { id: 'placeholder-id', name: 'OpenAI API' } },
    })
    OpenaiEmbeddings = {
        model: 'text-embedding-3-small',
        options: {},
    };

    @node({
        id: 'vector-store-retrieve-id',
        name: 'Vector Store Retrieve',
        type: '@n8n/n8n-nodes-langchain.vectorStoreInMemory',
        version: 1,
        position: [1600, 900],
    })
    VectorStoreRetrieve = {
        mode: 'retrieve',
        toolName: 'TradingKnowledge',
        toolDescription: 'Consulta aquí tus manuales de trading, estrategias y teoría personalizada.',
        memoryKey: {
            mode: 'list',
            value: 'forex_knowledge',
        },
        prompt: '={{ $input.item.json.query }}',
    };

    @node({
        id: 'retriever-vector-store-id',
        name: 'Retriever Vector Store',
        type: '@n8n/n8n-nodes-langchain.retrieverVectorStore',
        version: 1,
        position: [1750, 900],
    })
    RetrieverVectorStore = {
        topK: 5,
    };

    @node({
        id: 'manual-trigger-id',
        name: 'Manual Documents Upload',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [1000, 1100],
    })
    ManualDocumentsUpload = {};

    @node({
        id: 'data-loader-id',
        name: 'Data Loader',
        type: '@n8n/n8n-nodes-langchain.documentDefaultDataLoader',
        version: 1,
        position: [1150, 1100],
    })
    DataLoader = {
        dataType: 'binary',
        binaryDataKey: 'data',
        binaryMode: 'allInputData',
        loader: 'auto',
    };

    @node({
        id: 'text-splitter-id',
        name: 'Text Splitter',
        type: '@n8n/n8n-nodes-langchain.textSplitterRecursiveCharacterTextSplitter',
        version: 1,
        position: [1300, 1250],
    })
    TextSplitter = {
        chunkSize: 1000,
        chunkOverlap: 100,
    };

    @node({
        id: 'vector-store-ingest-id',
        name: 'Vector Store Ingest',
        type: '@n8n/n8n-nodes-langchain.vectorStoreInMemory',
        version: 1,
        position: [1450, 1100],
    })
    VectorStoreIngest = {
        mode: 'insert',
        memoryKey: {
            mode: 'list',
            value: 'forex_knowledge',
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.ScheduleTrigger.out(0).to(this.ForexData.in(0));
        this.ForexData.out(0).to(this.DataPreparer.in(0));
        this.DataPreparer.out(0).to(this.AiAgent.in(0));
        this.AiAgent.out(0).to(this.WhatsappAlert.in(0));
        this.ManualDocumentsUpload.out(0).to(this.DataLoader.in(0));
        this.DataLoader.out(0).to(this.VectorStoreIngest.in(0));

        this.AiAgent.uses({
            ai_languageModel: this.GroqChatModel.output,
            ai_memory: this.SimpleMemory.output,
            ai_retriever: this.RetrieverVectorStore.output,
            ai_tool: [this.MarketNews.output, this.EconomicCalendar.output],
        });
        this.VectorStoreRetrieve.uses({
            ai_embedding: this.OpenaiEmbeddings.output,
        });
        this.RetrieverVectorStore.uses({
            ai_vectorStore: this.VectorStoreRetrieve.output,
        });
    }
}
