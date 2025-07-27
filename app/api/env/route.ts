import { NextResponse } from "next/server"

export async function GET() {
  // Retorna as variáveis de ambiente públicas para o frontend
  return NextResponse.json({
    apiUrl: process.env.GOWA_API_URL || "",
    apiKey: process.env.GOWA_API_KEY || ""
  })
}

