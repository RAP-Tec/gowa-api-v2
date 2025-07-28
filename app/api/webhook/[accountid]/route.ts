
import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const verifyTokenDefault = process.env.VERIFY_TOKEN || "010101010101010101010"
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
      verifyToken = json[params.accountid].verify_token || verifyTokenDefault;
    } else {
      verifyToken = verifyTokenDefault;
    }

  } catch {
    console.log(`ERRO: GET: Ao ler json do accountid: ${params.accountid}`)
  }

  // Verificar se os parâmetros correspondem ao esperado
  if (mode === 'subscribe' && token === verifyToken) {
    console.log(`WEBHOOK VERIFIED FOR ACCOUNT ${params.accountid}`)
    return new NextResponse(challenge, { status: 200 })
  } else if (!mode) {
    // Se não for uma requisição de verificação, retornar informações da plataforma
    console.log(`WEBHOOK GET RESPONSE 200 FOR ACCOUNT ${params.accountid} - verifyToken: ${verifyToken}`)
    return NextResponse.json(
      {
        status: 200,
        message: "Gowa Plataforma Webhook API",
        version: "2.3.36",
        clientName: "gowa_plataforma_api",
        accountId: params.accountid
      },
      { status: 200 }
    )
  } else {
    console.log(`WEBHOOK GET RESPONSE 403 FOR ACCOUNT ${params.accountid}`)
    return new NextResponse(null, { status: 403 })
  }
}

// Rota para requisições POST (recebimento de eventos)
export async function POST(request: NextRequest, { params }: { params: { accountid: string } }) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
  // console.log(`\n\nWebhook received for account ${params.accountid} at ${timestamp}\n`)
  
  // Obter o corpo da requisição
  const body = await request.json()

  let chat_api_url = "";
  let chat_api_key = "";
  let send_post_url_1 = "";
  let send_post_url_2 = "";
  let send_post_url_3 = "";

  try {
    const dataPost = await fs.readFile(DATA_PATH, "utf-8");
    const jsonPost = JSON.parse(dataPost);

    if (jsonPost[params.accountid] && jsonPost[params.accountid].chat_api_url) {
      chat_api_url = jsonPost[params.accountid].chat_api_url || "";
    }

    if (jsonPost[params.accountid] && jsonPost[params.accountid].chat_api_key) {
      chat_api_key = jsonPost[params.accountid].chat_api_key || "";
    }

    if (jsonPost[params.accountid] && jsonPost[params.accountid].send_post_url_1) {
      send_post_url_1 = jsonPost[params.accountid].send_post_url_1 || "";
    }

    if (jsonPost[params.accountid] && jsonPost[params.accountid].send_post_url_2) {
      send_post_url_2 = jsonPost[params.accountid].send_post_url_2 || "";
    }

    if (jsonPost[params.accountid] && jsonPost[params.accountid].send_post_url_3) {
      send_post_url_3 = jsonPost[params.accountid].send_post_url_3 || "";
    }
  } catch {
    console.log(`ERRO: POST: Ao ler json do accountid: ${params.accountid}`)
  }


  // Enviar o mesmo conteúdo para a URL dinâmica do Chatwoot
//  const CHAT_API_URL = process.env.CHAT_API_URL || "https://app.gowa.com.br/api/v1"
//  const chatSendPostUrl = `${CHAT_API_URL}/accounts/${params.accountid}/conversations`
//  if (chatSendPostUrl) {
  if (chat_api_url) {
    try {
      // Enviar de forma assíncrona sem esperar resposta
      fetch(chat_api_url, {
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
  
  // Enviar o mesmo conteúdo para a URL definida em send_post_url_1
  if (send_post_url_1) {
    try {
      fetch(send_post_url_1, {
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
  
  // Enviar o mesmo conteúdo para a URL definida em send_post_url_2
  if (send_post_url_2) {
    try {
      fetch(send_post_url_2, {
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

  // Enviar o mesmo conteúdo para a URL definida em send_post_url_3
  if (send_post_url_3) {
    try {
      fetch(send_post_url_3, {
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