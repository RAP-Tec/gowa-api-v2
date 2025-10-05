import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { instanceName: string } }
) {
  try {
    const { instanceName } = params
    const body = await request.json()

    // Validar os dados do proxy
    const { enabled, host, port, protocol, username, password } = body

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Campo 'enabled' deve ser um boolean" },
        { status: 400 }
      )
    }

    if (enabled) {
      if (!host || typeof host !== "string") {
        return NextResponse.json(
          { success: false, error: "Campo 'host' é obrigatório quando proxy está habilitado" },
          { status: 400 }
        )
      }

      if (!port || typeof port !== "number") {
        return NextResponse.json(
          { success: false, error: "Campo 'port' é obrigatório e deve ser um número quando proxy está habilitado" },
          { status: 400 }
        )
      }

      if (!protocol || !["http", "https", "socks4", "socks5"].includes(protocol)) {
        return NextResponse.json(
          { success: false, error: "Campo 'protocol' deve ser 'http', 'https', 'socks4' ou 'socks5'" },
          { status: 400 }
        )
      }
    }

    // Preparar dados para envio para a Evolution API
    const proxyData = {
      enabled,
      host: enabled ? host : undefined,
      port: enabled ? port.toString() : undefined,
      protocol: enabled ? protocol : undefined,
      username: enabled && username ? username : undefined,
      password: enabled && password ? password : undefined,
    }

    // Fazer requisição para a Evolution API
    const evolutionApiUrl = process.env.EVOLUTION_API_URL || "http://localhost:8080"
    const evolutionApiKey = process.env.EVOLUTION_API_KEY || ""

    const response = await fetch(`${evolutionApiUrl}/proxy/set/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": evolutionApiKey,
      },
      body: JSON.stringify(proxyData),
    })

    const responseData = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: responseData.message || `Erro da Evolution API: ${response.status}` 
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Proxy atualizado com sucesso",
      data: responseData,
    })

  } catch (error) {
    console.error("Erro ao atualizar proxy:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro interno do servidor" 
      },
      { status: 500 }
    )
  }
}
