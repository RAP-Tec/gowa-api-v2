import { NextRequest, NextResponse } from "next/server"

// Chave de verificação do webhook
const verifyToken = process.env.VERIFY_TOKEN || ""

// Rota para requisições GET (verificação do webhook)
export async function GET(request: NextRequest) {
  // Extrair parâmetros da query
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const challenge = searchParams.get('hub.challenge')
  const token = searchParams.get('hub.verify_token')

  // Verificar se os parâmetros correspondem ao esperado
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED')
    return new NextResponse(challenge, { status: 200 })
  } else if (!mode) {
    // Se não for uma requisição de verificação, retornar informações da plataforma
    return NextResponse.json(
      {
        status: 200,
        message: "Gowa Plataforma Webhook API",
        version: "2.3.5",
        clientName: "gowa_plataforma_api",
      },
      { status: 200 }
    )
  } else {
    return new NextResponse(null, { status: 403 })
  }
}

// Rota para requisições POST (recebimento de eventos)
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
  console.log(`\n\nWebhook received ${timestamp}\n`)
  
  // Obter o corpo da requisição
  const body = await request.json()
  // console.log(JSON.stringify(body, null, 2))

  // Enviar o mesmo conteúdo para a URL definida em CHAT_SEND_POST_URL
  const chatSendPostUrl = process.env.CHAT_SEND_POST_URL || ""
  if (chatSendPostUrl) {
    try {
      // Enviar de forma assíncrona sem esperar resposta
      fetch(chatSendPostUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).catch(() => {
        // Ignorar erros
      })
    } catch {
      // Ignorar qualquer erro
    }
  }
  
  // Enviar o mesmo conteúdo para a URL definida em SEND_POST_URL
  const sendPostUrl = process.env.SEND_POST_URL || ""
  if (sendPostUrl) {
    try {
      // Enviar de forma assíncrona sem esperar resposta
      fetch(sendPostUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).catch(() => {
        // Ignorar erros
      })
    } catch {
      // Ignorar qualquer erro
    }
  }
  
  // Responder com sucesso
  return new NextResponse(null, { status: 200 })
}

// Trata requisições OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // Ajuste conforme sua política de CORS
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
    },
  })
}