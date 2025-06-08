import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    {
      status: 200,
      message: "Gowa Devices API Success",
      version: "2.2.4.4",
      clientName: "gowa_kolek",
      manager: "http://kolek.gowa.com.br/manager",
      documentation: "https://www.postman.com/gowa-7081409/gowa-s-workspace"
    },
    { status: 200 }
  )
}