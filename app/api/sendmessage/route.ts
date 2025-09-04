import { NextRequest, NextResponse } from "next/server"
import { evolutionApi } from "@/lib/evolution-api"
import { convAuthKey } from "@/lib/helpers"

// Chaves de autenticação
const AUTH_KEY = process.env.AUTH_KEY || ""
const GOWA_API_KEY = process.env.GOWA_API_KEY || ""

// Handle POST requests to send a message
export async function POST(request: NextRequest) {
  try {

    const body = await request.json()

    // 1. Validar API Key do Header
    // const apiKeyFromHeader = request.headers.get('apikey') || ""
    const apiKeyFromHeader = body.authkey || GOWA_API_KEY

    if (!apiKeyFromHeader || apiKeyFromHeader === "") {
      return NextResponse.json(
        { success: false, error: "API Key not provided (authkey)" },
        { status: 401 }
      )
    }

    // 2. Validar se a GOWA_API_KEY está definida no ambiente
    /* if (GOWA_API_KEY != "") {
      if (apiKeyFromHeader !== GOWA_API_KEY) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid Global API Key (apikey)" },
          { status: 401 }
        )
      }
    } */
    
    // 3. Validar Auth Key do Body se está definida no ambiente
    /* if (AUTH_KEY != "") {
      if (!body.authkey || body.authkey !== AUTH_KEY) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid Global Authentication Key (AUTHKEY)" },
          { status: 401 }
        )
      }
    } */

    // Validar parâmetros obrigatórios
    if (!body.authkey) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: authkey" },
        { status: 400 }
      )
    }

    if (!body.deviceid) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: deviceid" },
        { status: 400 }
      )
    }

    if (!body.to) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: to" },
        { status: 400 }
      )
    }

    if (!body.message) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: message" },
        { status: 400 }
      )
    }

    // Se todas as validações passaram, prosseguir
//    console.log("Autenticação bem-sucedida. Enviando mensagem...")
    // Call the Evolution API to send the message
    const result = await evolutionApi.sendMessage(body.deviceid, body.to, body.message, apiKeyFromHeader)

    // Return the response
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in /sendmessage endpoint:", error)

    // Trata erros de parsing do JSON ou outros erros inesperados
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

// Also export GET method to ensure the route is recognized
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
      "Access-Control-Allow-Origin": "*", // Ajuste conforme sua política de CORS
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey", // Adicionado apikey
    },
  })
}
