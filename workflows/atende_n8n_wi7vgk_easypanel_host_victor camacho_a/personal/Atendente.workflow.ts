import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Atendente
// Nodes   : 16  |  Connections: 8
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// AiAgent                            agent                      [AI]
// GroqChatModel                      lmChatGroq                 [creds] [ai_languageModel]
// SimpleMemory                       memoryBufferWindow         [ai_memory]
// EnviarTexto                        evolutionApi               [creds]
// Think                              toolThink                  [ai_tool]
// BuscarCliente                      notionTool                 [creds] [ai_tool]
// GuardarClienteNotion               notionTool                 [creds] [ai_tool]
// AgendarConsultoria                 googleCalendarTool         [creds] [ai_tool]
// ReagendarConsultoria               googleCalendarTool         [creds] [ai_tool]
// ActualizarClienteNotion            notionTool                 [creds] [ai_tool]
// AudioOEscrito                      if
// ConvertidorAData                   code
// TranscripcionConGroq               httpRequest                [creds]
// PreparadorDeDatos                  code
// NoRespondeSiAdministradorHabla1    if
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → NoRespondeSiAdministradorHabla1
//     .out(1) → AudioOEscrito
//        → ConvertidorAData
//          → TranscripcionConGroq
//            → PreparadorDeDatos
//              → AiAgent
//                → EnviarTexto
//       .out(1) → PreparadorDeDatos (↩ loop)
//
// AI CONNECTIONS
// AiAgent.uses({ ai_languageModel: GroqChatModel, ai_memory: SimpleMemory, ai_tool: [Think, BuscarCliente, GuardarClienteNotion, AgendarConsultoria, ReagendarConsultoria, ActualizarClienteNotion] })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'T5DP7sRe0KQRyJ10',
    name: 'Atendente',
    active: true,
    settings: { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: true },
})
export class AtendenteWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '58c12d57-332f-4e10-b080-c780a7a4a22d',
        webhookId: 'be33116e-4877-47c3-adbe-3cf4f1f6da03',
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [-960, -400],
    })
    Webhook = {
        httpMethod: 'POST',
        path: 'Ja atendente de whatsapp',
        options: {},
    };

    @node({
        id: '2e0fc078-5d1a-4d42-bd8a-cf286f921311',
        name: 'AI Agent',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 3.1,
        position: [1088, -400],
    })
    AiAgent = {
        options: {
            systemMessage: `=<system_prompt>
  <rol_y_perfil>
    Actúa como la Coordinadora de Pacientes Senior de Schbelta Clinic (AtendeJá). Tu tono es sumamente profesional, cálido, empático y resolutivo. No hablas como un bot, sino como una asistente experta que ya conoce al paciente.
  </rol_y_perfil>

  <tarea_principal>
    Tu misión es gestionar de punta a punta la relación con el paciente por WhatsApp: desde la identificación inicial en el CRM hasta el agendamiento, reprogramación o cancelación de citas en el calendario, asegurando que toda la información relevante quede registrada en Notion.
  </tarea_principal>

  <contexto_tecnico_y_herramientas>
    - Fecha y hora actual: {{ $json.fechaHoraHoy }} (Úsala como referencia para "mañana", "el lunes", etc.).
    - Nombre del paciente: {{ $json.nombreCliente }}.
    - Teléfono: {{ $json.telefono }}.

    Cuentas con las siguientes herramientas que DEBES usar con precisión:
    1. **Buscar_Cliente**: Úsala siempre al inicio para verificar si el paciente ya existe y obtener su 'Page ID' de Notion y su 'Calendar ID'.
    2. **Guardar_Cliente_Notion**: Úsala para registrar a pacientes nuevos.
    3. **Agendar_Consultoria**: Para crear nuevas citas en Google Calendar.
    4. **Reagendar_Consultoria**: Úsala si el paciente pide cambiar fecha/hora (necesitarás el 'Calendar ID' que obtienes al buscar al cliente).
    5. **Actualizar_Cliente_Notion.**: Úsala para añadir notas sobre la evolución del paciente o guardar el nuevo 'Calendar ID'.
    6. **Think**: OBLIGATORIO usarla para razonar internamente antes de dar una respuesta final o ejecutar una herramienta.
  </contexto_tecnico_y_herramientas>

  <comprension_clinica_y_pacientes>
    - ENTIENDE EL LENGUAJE NATURAL: 
      * "Se me cayó la tapadura" -> Necesita cita de restauración.
      * "Me duele el flemón" -> Urgencia por infección.
      * "Ajuste de alambres" -> Control de ortodoncia.
      * "Limpieza" -> Profilaxis dental.
    - MANEJO TEMPORAL: Traduce "mañana por la tarde" a la fecha exacta sumando 1 día a la fecha actual y buscando huecos entre las 15:00 y 18:00.
  </comprension_clinica_y_pacientes>

  <restricciones_y_blindaje>
    - NEGATIVE PROMPT: NUNCA des diagnósticos médicos ni sugieras fármacos.
    - SEGURIDAD: Si el paciente reporta dolor nivel 10 o hemorragia, busca el hueco más próximo de urgencia y avisa que un doctor le atenderá de inmediato.
    - FLUJO DE TRABAJO: No intentes agendar sin antes haber buscado al cliente en Notion para tener su historial.
    - FORMATO WHATSAPP: Mensajes cortos (máximo 4 líneas). Usa negritas (*texto*) para fechas y horas. Ofrece opciones de horarios en listas con emojis.
  </restricciones_y_blindaje>

  <formato_de_salida>
    Devuelve únicamente el texto que el paciente leerá en WhatsApp. Sin etiquetas XML, sin comillas y sin explicaciones técnicas. Termina siempre con una pregunta guía.
  </formato_de_salida>
</system_prompt>`,
        },
    };

    @node({
        id: '06e62222-aba5-424f-bfe4-fa38bbf3389f',
        name: 'Groq Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatGroq',
        version: 1,
        position: [704, -176],
        credentials: { groqApi: { id: 'ajcc5lsup6acbPrm', name: 'Groq audio whisper' } },
    })
    GroqChatModel = {
        model: 'llama-3.3-70b-versatile',
        options: {},
    };

    @node({
        id: '67d79bf1-9c9a-492e-9b9f-ef64b97f165f',
        name: 'Simple Memory',
        type: '@n8n/n8n-nodes-langchain.memoryBufferWindow',
        version: 1.3,
        position: [832, -176],
    })
    SimpleMemory = {
        sessionIdType: 'customKey',
        sessionKey: '={{ $json.telefono }}',
        contextWindowLength: 8,
    };

    @node({
        id: 'f2025343-2204-40e9-8167-3d9d4329731f',
        name: 'Enviar texto',
        type: 'n8n-nodes-evolution-api.evolutionApi',
        version: 1,
        position: [1808, -400],
        credentials: { evolutionApi: { id: 'dhZcAfk3MJMwaSHT', name: 'Evolution account' } },
    })
    EnviarTexto = {
        resource: 'messages-api',
        instanceName: '=AtendeJa',
        remoteJid: "={{ $('PREPARADOR DE DATOS').item.json.telefono }}",
        messageText: '={{ $json.output }}',
        options_message: {},
    };

    @node({
        id: '9ac6dd87-6b59-4b34-a1a1-0c2473f336de',
        name: 'Think',
        type: '@n8n/n8n-nodes-langchain.toolThink',
        version: 1.1,
        position: [960, -176],
    })
    Think = {};

    @node({
        id: '67710e69-8088-40a2-b142-596cd3d96ea4',
        name: 'Buscar_Cliente',
        type: 'n8n-nodes-base.notionTool',
        version: 2.2,
        position: [1088, -176],
        credentials: { notionApi: { id: 'T9SND4HuZ6c5dYLF', name: 'Notion account' } },
    })
    BuscarCliente = {
        resource: 'databasePage',
        operation: 'getAll',
        databaseId: {
            __rl: true,
            value: 'b1436364-dc7b-4756-990d-ca04000385bd',
            mode: 'list',
            cachedResultName: 'CRM AtendeJa - Leads',
            cachedResultUrl: 'https://www.notion.so/b1436364dc7b4756990dca04000385bd',
        },
        limit: 20,
        simple: false,
        filterType: 'manual',
        matchType: 'allFilters',
        filters: {
            conditions: [
                {
                    key: 'Phone|rich_text',
                    condition: 'equals',
                    richTextValue: "={{ $fromAI('Telefono', 'Número de WhatsApp del cliente a buscar', 'string') }}",
                },
            ],
        },
        options: {},
    };

    @node({
        id: '221a1d4b-dde5-446e-94c3-fcfe59e82514',
        name: 'Guardar_Cliente_Notion',
        type: 'n8n-nodes-base.notionTool',
        version: 2.2,
        position: [1216, -176],
        credentials: { notionApi: { id: 'T9SND4HuZ6c5dYLF', name: 'Notion account' } },
    })
    GuardarClienteNotion = {
        resource: 'databasePage',
        databaseId: {
            __rl: true,
            value: 'b1436364-dc7b-4756-990d-ca04000385bd',
            mode: 'list',
            cachedResultName: 'CRM AtendeJa - Leads',
            cachedResultUrl: 'https://www.notion.so/b1436364dc7b4756990dca04000385bd',
        },
        title: '={{ $json.nombreCliente }}',
        propertiesUi: {
            propertyValues: [
                {
                    key: 'Nombre|title',
                    title: "={{ $fromAI('Nombre', 'Nombre completo del cliente', 'string') }}",
                },
                {
                    key: 'Empresa|rich_text',
                    textContent: "={{ $fromAI('Empresa', 'Nombre del negocio o empresa', 'string') }}",
                },
                {
                    key: 'Email|rich_text',
                    textContent: "={{ $fromAI('Email', 'Correo electronico del cliente', 'string') }}",
                },
                {
                    key: 'Notas|rich_text',
                    textContent:
                        "={{ $fromAI('Notas', 'Resumen claro del problema principal que tiene el cliente', 'string') }}",
                },
                {
                    key: 'Phone|rich_text',
                    textContent: '={{ $json.telefono }}',
                },
                {
                    key: 'Follow-Up Date|date',
                    date: '={{ $json.fechaHoraHoy }}',
                },
                {
                    key: 'Calendar ID|rich_text',
                    textContent:
                        "={{ $fromAI('id_evento', 'El ID del evento generado por Google Calendar. Si aún no hay cita agendada, escribe \"Pendiente\"', 'string') }}",
                },
            ],
        },
        options: {},
    };

    @node({
        id: '0f8c32ec-7b40-47f0-835c-aa2ca4c1ce13',
        name: 'Agendar_Consultoria',
        type: 'n8n-nodes-base.googleCalendarTool',
        version: 1.3,
        position: [1344, -176],
        credentials: { googleCalendarOAuth2Api: { id: 'eBmDZO4wagSdmdEM', name: 'Google Calendar account' } },
    })
    AgendarConsultoria = {
        descriptionType: 'manual',
        toolDescription: 'Create an event in Google Calendar',
        calendar: {
            __rl: true,
            value: 'atendejasolucoesautomaticas@gmail.com',
            mode: 'list',
            cachedResultName: 'atendejasolucoesautomaticas@gmail.com',
        },
        additionalFields: {},
    };

    @node({
        id: '2758faac-06b7-467e-a4c0-c4697f680454',
        name: 'Reagendar_Consultoria',
        type: 'n8n-nodes-base.googleCalendarTool',
        version: 1.3,
        position: [1472, -176],
        credentials: { googleCalendarOAuth2Api: { id: 'eBmDZO4wagSdmdEM', name: 'Google Calendar account' } },
    })
    ReagendarConsultoria = {
        operation: 'update',
        calendar: {
            __rl: true,
            value: 'atendejasolucoesautomaticas@gmail.com',
            mode: 'list',
            cachedResultName: 'atendejasolucoesautomaticas@gmail.com',
        },
        eventId:
            "={{ $fromAI('id_evento', 'El ID del evento que leíste del perfil del cliente en Notion', 'string') }}",
        updateFields: {
            end: "={{ $fromAI('nuevo_fin', 'La nueva fecha y hora de fin en formato ISO (1 hora después del inicio)', 'string') }}",
            start: "={{ $fromAI('nuevo_inicio', 'La nueva fecha y hora de inicio en formato ISO', 'string') }}",
        },
    };

    @node({
        id: 'd90bca89-ed3d-4408-b5c1-badff17a56fb',
        name: 'Actualizar_Cliente_Notion.',
        type: 'n8n-nodes-base.notionTool',
        version: 2.2,
        position: [1600, -176],
        credentials: { notionApi: { id: 'T9SND4HuZ6c5dYLF', name: 'Notion account' } },
    })
    ActualizarClienteNotion = {
        resource: 'databasePage',
        operation: 'update',
        pageId: {
            __rl: true,
            value: "=={{ $fromAI('notion_page_id', 'El ID de la página de Notion que encontraste al buscar al cliente', 'string') }}",
            mode: 'url',
        },
        propertiesUi: {
            propertyValues: [
                {
                    key: '=Calendar ID|rich_text',
                    textContent: "=={{ $fromAI('id_evento', 'El ID del evento de Google Calendar', 'string') }}",
                },
                {
                    key: '=Notas|rich_text',
                    textContent:
                        "=={{ $fromAI('nuevas_notas', 'Toma la nota antigua que leíste y agrégale al final (sin borrar lo anterior) la nueva información relevante del cliente descubierta hoy', 'string') }}",
                },
            ],
        },
        options: {},
    };

    @node({
        id: '9e966dba-544c-4a8b-bff5-55650ab27e35',
        name: 'AUDIO O  ESCRITO',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [-416, -400],
    })
    AudioOEscrito = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'b10c0bf1-063d-4105-8e81-cf972db243b5',
                    leftValue: '={{ $json.body.data.messageType }}',
                    rightValue: 'audio',
                    operator: {
                        type: 'string',
                        operation: 'contains',
                    },
                },
            ],
            combinator: 'or',
        },
        options: {},
    };

    @node({
        id: '657f7c5a-3bea-4b50-b955-b43fa42ae890',
        name: 'CONVERTIDOR A DATA',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-208, -512],
    })
    ConvertidorAData = {
        jsCode: `for (let item of $input.all()) {
  let base64String = item.json.body?.data?.message?.base64 || item.json.message?.base64 || item.json.base64;
  
  if (!base64String) {
    throw new Error("❌ No se encontró el audio.");
  }

  item.binary = {
    file: {  // <--- ¡AQUÍ ESTÁ LA MAGIA! Cambiamos 'data' por 'file'
      data: base64String, 
      mimeType: 'audio/ogg',
      fileName: 'audio.ogg'
    }
  };
}
return $input.all();`,
    };

    @node({
        id: 'b74ed5ca-76a2-474c-9b10-95bee590659f',
        name: 'TRANSCRIPCION CON GROQ',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [32, -512],
        credentials: { groqApi: { id: 'ajcc5lsup6acbPrm', name: 'Groq audio whisper' } },
    })
    TranscripcionConGroq = {
        method: 'POST',
        url: 'https://api.groq.com/openai/v1/audio/transcriptions',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'groqApi',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    name: 'model',
                    value: 'whisper-large-v3',
                },
                {
                    parameterType: 'formBinaryData',
                    name: 'file',
                    inputDataFieldName: 'file',
                },
            ],
        },
        options: {},
    };

    @node({
        id: '16185ef6-412d-4409-b14b-efaa8355fdc5',
        name: 'PREPARADOR DE DATOS',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [256, -400],
    })
    PreparadorDeDatos = {
        jsCode: `// 1. Rescatamos los datos usando la memoria del Webhook original
const webhookData = $('Webhook').first().json;

if (webhookData.body.event !== "messages.upsert") {
    return [];
}

let userMessage = '';
let phoneNumber = '';
let userName = 'Prospecto';
let isFromMe = false;

try {
    const messageData = webhookData.body.data;
    phoneNumber = (messageData.key.remoteJid || '').replace('@s.whatsapp.net', '');
    userName = messageData.pushName || 'Prospecto';
    isFromMe = messageData.key.fromMe || false;

    // 2. LA MAGIA: ¿De qué ruta viene la información?
    if ($input.first().json.text) {
        // RUTA A: Viene de Groq (Audio transcrito)
        userMessage = $input.first().json.text;
    } else {
        // RUTA B: Viene directo de WhatsApp (Texto normal)
        let msg = messageData.message;
        if (msg?.conversation) {
            userMessage = msg.conversation;
        } else if (msg?.extendedTextMessage?.text) {
            userMessage = msg.extendedTextMessage.text;
        }
    }
} catch (error) {
    console.log("Error procesando mensaje:", error);
}

// 3. Empacamos todo y se lo damos al Agente IA
return {
    chatInput: userMessage,
    telefono: phoneNumber,
    nombreCliente: userName,
    isFromMe: isFromMe
};`,
    };

    @node({
        id: '2d9d8254-c457-4bce-96b7-cddc48034014',
        name: 'No responde si administrador habla1',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [-704, -320],
    })
    NoRespondeSiAdministradorHabla1 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'd9802da7-1306-4669-a89d-742e0349fbde',
                    leftValue: '={{ $json.isFromMe }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
                {
                    id: '639c161d-c2a0-417c-8b9b-879b79e5f8ce',
                    leftValue: false,
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'false',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.NoRespondeSiAdministradorHabla1.in(0));
        this.AiAgent.out(0).to(this.EnviarTexto.in(0));
        this.AudioOEscrito.out(0).to(this.ConvertidorAData.in(0));
        this.AudioOEscrito.out(1).to(this.PreparadorDeDatos.in(0));
        this.ConvertidorAData.out(0).to(this.TranscripcionConGroq.in(0));
        this.TranscripcionConGroq.out(0).to(this.PreparadorDeDatos.in(0));
        this.PreparadorDeDatos.out(0).to(this.AiAgent.in(0));
        this.NoRespondeSiAdministradorHabla1.out(1).to(this.AudioOEscrito.in(0));

        this.AiAgent.uses({
            ai_languageModel: this.GroqChatModel.output,
            ai_memory: this.SimpleMemory.output,
            ai_tool: [
                this.Think.output,
                this.BuscarCliente.output,
                this.GuardarClienteNotion.output,
                this.AgendarConsultoria.output,
                this.ReagendarConsultoria.output,
                this.ActualizarClienteNotion.output,
            ],
        });
    }
}
