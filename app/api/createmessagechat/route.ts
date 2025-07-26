import { NextRequest, NextResponse } from "next/server"

// Chaves de autenticação
const AUTH_KEY = process.env.AUTH_KEY || ""
const GOWA_API_KEY = process.env.GOWA_API_KEY || ""

// Handle POST requests para enviar mensagens ao Chatwoot
export async function POST(request: NextRequest) {
  try {
    // 1. Validar API Key do Header
    const apiKeyFromHeader = request.headers.get('apikey') || ""
    if (!apiKeyFromHeader || apiKeyFromHeader === "") {
      return NextResponse.json(
        { success: false, error: "API Key not provided (apikey)" },
        { status: 401 }
      )
    }
    // 2. Validar se a GOWA_API_KEY está definida no ambiente
    if (GOWA_API_KEY != "") {
      if (apiKeyFromHeader !== GOWA_API_KEY) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid Global API Key (apikey)" },
          { status: 401 }
        )
      }
    }

    const searchParams = request.nextUrl.searchParams
    const accountid = searchParams.get('accountid')

    if (!accountid) {
        return NextResponse.json(
            { success: false, error: "Missing required query parameter: accountid" },
            { status: 400 }
        )
    }

    const body = await request.json()

    // Validar campos obrigatórios do corpo no formato da Meta
    if (!body.to || !body.text || !body.text.body) {
      return NextResponse.json(
        { success: false, error: "Missing required body parameters: to, text.body" },
        { status: 400 }
      )
    }


    const CHAT_API_URL = process.env.CHAT_API_URL || "https://app.gowa.com.br/api/v1"

    // Verificar se o contato existe no Chatwoot
    const searchUrl = `${CHAT_API_URL}/accounts/${accountid}/contacts/search?q=${encodeURIComponent(body.to)}`
const searchResponse = await fetch(searchUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'apikey': apiKeyFromHeader
  }
})

if (!searchResponse.ok) {
  throw new Error(`Chatwoot contact search error: ${searchResponse.status}`)
}

const searchResult = await searchResponse.json()
if (!searchResult.payload || searchResult.payload.length === 0) {
  return NextResponse.json(
    { success: false, error: "Contact not found in Chatwoot" },
    { status: 404 }
  )
}

    // Obter o ID da primeira caixa de entrada (inbox)
    const inboxesUrl = `${CHAT_API_URL}/accounts/${accountid}/inboxes`;
    const inboxesResponse = await fetch(inboxesUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKeyFromHeader
        }
    });

    if (!inboxesResponse.ok) {
        throw new Error(`Chatwoot inboxes fetch error: ${inboxesResponse.status}`);
    }

    const inboxesResult = await inboxesResponse.json();
    if (!inboxesResult.payload || inboxesResult.payload.length === 0) {
        return NextResponse.json(
            { success: false, error: "No inboxes found for this account" },
            { status: 404 }
        );
    }

    const inboxId = inboxesResult.payload[0].id;

    // Enviar mensagem ao Chatwoot
    const chatwootUrl = `${CHAT_API_URL}/accounts/${accountid}/conversations`
    const response = await fetch(chatwootUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKeyFromHeader
      },
      body: JSON.stringify({
        phonenumber: body.to,
        message: body.text.body,
        inbox_id: inboxId
      })
    })

    if (!response.ok) {
      throw new Error(`Chatwoot API error: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("Error in /createmessagechat endpoint:", error)

    let errorMessage = "Unknown error occurred"
    let errorStatus = 500
    if (error instanceof SyntaxError) {
      errorMessage = "Invalid JSON format in request body"
      errorStatus = 400
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: errorStatus }
    )
  }
}

// Método GET não permitido
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use POST instead." },
    { status: 405 }
  )
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
    },
  })
}