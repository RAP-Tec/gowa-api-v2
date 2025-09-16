import { NextResponse } from "next/server"

export async function GET() {
  // Retorna as variáveis de ambiente públicas para o frontend
  // const apiKey = process.env.GOWA_API_KEY ? process.env.GOWA_API_KEY.substring(0, 10) : "";
  const apiKey = process.env.GOWA_API_KEY || "";
  return NextResponse.json({
    apiUrl: process.env.GOWA_API_URL || "",
    apiKey
  })
}

