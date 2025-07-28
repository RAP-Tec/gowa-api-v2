
import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_PATH = path.join(process.cwd(), "data.json")

// Rota para requisições GET (verificação do webhook)
export async function GET(request: NextRequest, { params }: { params: { accountid: string } }) {
  // Extrair parâmetros da query
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const challenge = searchParams.get('hub.challenge')
  const token = searchParams.get('hub.verify_token')

  // Buscar verify_token do data.json conforme o accountid
  let verifyToken = "";
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8");
    const json = JSON.parse(data);
    if (json[params.accountid] && json[params.accountid].verify_token) {
      verifyToken = json[params.accountid].verify_token;
    }
  } catch {}

  // Verificar se os parâmetros correspondem ao esperado
  if (mode === 'subscribe' && token === verifyToken) {
    console.log(`WEBHOOK VERIFIED FOR ACCOUNT ${params.accountid}`)
    return new NextResponse(challenge, { status: 200 })
  } else if (!mode) {
    // Se não for uma requisição de verificação, retornar informações da plataforma
    return NextResponse.json(
      {
        status: 200,
        message: "Gowa Plataforma Webhook API",
        version: "2.3.5",
        clientName: "gowa_plataforma_api",
        accountId: params.accountid
      },
      { status: 200 }
    )
  } else {
    return new NextResponse(null, { status: 403 })
  }
}

// Rota para requisições POST (recebimento de eventos)
export async function POST(request: NextRequest, { params }: { params: { accountid: string } }) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
  console.log(`\n\nWebhook received for account ${params.accountid} at ${timestamp}\n`)
  
  // Obter o corpo da requisição
  const body = await request.json()

  // Enviar o mesmo conteúdo para a URL dinâmica do Chatwoot
  const CHAT_API_URL = process.env.CHAT_API_URL || "https://app.gowa.com.br/api/v1"
  const chatSendPostUrl = `${CHAT_API_URL}/accounts/${params.accountid}/conversations`

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
  
  // Enviar o mesmo conteúdo para a URL definida em SEND_POST_URL (mantido para compatibilidade)
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
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
    },
  })
}