import { NextRequest, NextResponse } from "next/server"
import { evolutionApi } from "@/lib/evolution-api"
import { convAuthKey } from "@/lib/helpers"

// Chaves de autenticação
const AUTH_KEY = process.env.AUTH_KEY || ""
const GOWA_API_KEY = process.env.GOWA_API_KEY || ""

// Handle POST requests para conectar um dispositivo pelo número
export async function POST(request: NextRequest) {
  try {
    // 1. Validar API Key do Header
    const apiKeyFromHeader = request.headers.get('apikey')
    if (!apiKeyFromHeader || apiKeyFromHeader === "") {
      return NextResponse.json(
        { success: false, error: "API Key not provided (apikey)" },
        { status: 401 }
      )
    }
    // 2. Validar se a GOWA_API_KEY está definida no ambiente
    if (!GOWA_API_KEY) {
      if (apiKeyFromHeader !== GOWA_API_KEY) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid Global API Key (apikey)" },
          { status: 401 }
        )
      }
    }
    const body = await request.json()
    // 3. Validar Auth Key do Body se está definida no ambiente
    if (!AUTH_KEY) {
      if (!body.authkey || body.authkey !== AUTH_KEY) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid Global Authentication Key (AUTHKEY)" },
          { status: 401 }
        )
      }
    } else {
    // 4. Se não tiver env.AUTH_KEY então converte a chave de autenticação do header apiKeyFromHeader, invertendo a API_KEY e passando para minúsculas, e adicionando traços a cada 8 caracteres
      const convertedAuthKey = convAuthKey(apiKeyFromHeader || "")
      if (!body.authkey || body.authkey !== convertedAuthKey) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid Authentication Key (authkey)" },
          { status: 401 }
        )
      }
    }

    // Validar number
    if (!body.number) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: number" },
        { status: 400 }
      )
    }

    // Se ambas as chaves e number são válidos, prosseguir
//    console.log(`Autenticação bem-sucedida. Tentando obter QR Code para conectar dispositivo com número: ${body.number}`)

    // 3. Encontrar a instância pelo número
    const instanceDetails = await evolutionApi.getInstanceDetailsByNumber(body.number)

    if (!instanceDetails.exists || !instanceDetails.instanceName) {
//      console.log(`Nenhuma instância encontrada para o número: ${body.number}`)
      return NextResponse.json(
        {
          success: false,
          error: `Device with number ${body.number} not found. Cannot connect.`,
        },
        { status: 404 } // Not Found
      )
    }

    // 4. Chamar a função para obter o QR Code/Pairing Code usando o instanceName encontrado
//    console.log(`Instância encontrada: ${instanceDetails.instanceName}. Obtendo QR Code/Pairing Code...`)
    const qrResult = await evolutionApi.getQrCode(instanceDetails.instanceName)

    // 5. Retornar o resultado (QR Code/Pairing Code ou erro)
    if (qrResult.success) {
        return NextResponse.json({
            success: true,
            message: `Connection information for device number ${body.number} (Instance: ${instanceDetails.instanceName}) Send the QR Code or Pairing Code to the customer and ask them to read it within 30 seconds`,
            data: qrResult.data // Contém qrcode, base64, pairingCode
        })
    } else {
        return NextResponse.json({
            success: false,
            error: qrResult.error || `Failed to get data for device connection ${instanceDetails.instanceName}`,
        }, { status: 500 }) // Internal Server Error ou status apropriado do erro
    }

  } catch (error) {
    console.error("Error in /connectdevice endpoint:", error)

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
      "Access-Control-Allow-Origin": "*", // Ajuste conforme sua política de CORS
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey", // Adicionado apikey
    },
  })
}