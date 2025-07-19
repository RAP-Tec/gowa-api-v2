import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    {
      status: 200,
      message: "Gowa Plataforma Devices API",
      version: "2.3.5",
      clientName: "gowa_plataforma_api",
      manager: "/manager",
      documentation: "https://www.postman.com/rogerioamaral/gowa/overview"
    },
    { status: 200 }
  )
}