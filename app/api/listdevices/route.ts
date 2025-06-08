import { NextRequest, NextResponse } from "next/server"
import { evolutionApi } from "@/lib/evolution-api"
import { convAuthKey } from "@/lib/helpers"

// Chaves de autenticação
const AUTH_KEY = process.env.AUTH_KEY || ""
const GOWA_API_KEY = process.env.GOWA_API_KEY || ""

// Handle POST requests para listar devices/instances
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
    const body = await request.json()
    // 3. Validar Auth Key do Body se está definida no ambiente
    if (AUTH_KEY != "") {
      if (!body.authkey || body.authkey !== AUTH_KEY) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid Global Authentication Key (AUTHKEY)" },
          { status: 401 }
        )
      }
    } else {
    // 4. Se não tiver env.AUTH_KEY então converte a chave de autenticação do header apiKeyFromHeader, invertendo a API_KEY e passando para minúsculas, e adicionando traços a cada 8 caracteres
    /*  const convertedAuthKey = convAuthKey(apiKeyFromHeader)
      if (!body.authkey || body.authkey !== convertedAuthKey) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid Authentication Key (authkey)" },
          { status: 401 }
        )
      } */
    }

    //    console.log("Autenticação bem-sucedida. Listando instâncias...")
    const result = await evolutionApi.listInstances(apiKeyFromHeader)

    // Retorna o resultado da API Evolution
    return NextResponse.json(result)

  } catch (error) {
    console.error("Error in /listdevices endpoint:", error)
    
    // Trata erros de parsing do JSON ou outros erros inesperados
    let errorMessage = "Unknown error occurred"
    if (error instanceof SyntaxError) {
        errorMessage = "Invalid JSON format in request body"
    } else if (error instanceof Error) {
        errorMessage = error.message
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: error instanceof SyntaxError ? 400 : 500 } // Retorna 400 para JSON inválido
    )
  }
}

// Método GET não permitido (ou ajuste conforme necessário)
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
      "Access-Control-Allow-Methods": "POST, OPTIONS", // Permitir POST e OPTIONS
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey", // Permitir os headers necessários
    },
  })
}