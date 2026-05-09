const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Uses Groq (Llama 3) to summarize inbound messages and suggest professional replies.
 */
async function groqEnrich(messageBody, contact) {
  if (!messageBody || !process.env.GROQ_API_KEY) {
    return { summary: null, reply: null };
  }

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente de CRM B2B profissional. 
                    O contato se chama "${contact.name || 'desconhecido'}".
                    Responda APENAS com JSON no formato: 
                    { "summary": "resumo em 1 frase", "reply": "resposta sugerida profissional em português" }`
        },
        { role: 'user', content: messageBody }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('❌ [groqEnrich] Error:', error.message);
    return { summary: 'Erro ao processar resumo', reply: 'Sugestão indisponível' };
  }
}

module.exports = { groqEnrich };
