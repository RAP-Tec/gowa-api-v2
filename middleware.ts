import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Lidar com requisições preflight OPTIONS primeiro
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    response.headers.append("Access-Control-Allow-Origin", "*") // Seja mais específico se possível
    response.headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.append("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey") // Adicionado apikey
    return response;
  }

  // Para outras requisições, adicionar headers à resposta que vai para o cliente
  const response = NextResponse.next()

  response.headers.append("Access-Control-Allow-Origin", "*") // Seja mais específico se possível
  // Os headers abaixo são mais relevantes para a resposta OPTIONS, mas podem ser mantidos se necessário
  response.headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.append("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey")

  return response
}

// Apply middleware to API routes
export const config = {
  matcher: ["/api/:path*"],
}

