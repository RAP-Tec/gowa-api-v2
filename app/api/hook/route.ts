import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data.json");

// GET: Lista todos os hooks
export async function GET() {
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: "Erro ao ler data.json" }, { status: 500 });
  }
}

// POST: Cria ou atualiza um hook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await fs.readFile(DATA_PATH, "utf-8");
    const json = JSON.parse(data);
    const maxWebhooks = parseInt(process.env.MAX_WEBHOOKS || "100", 10);
    // Se for novo registro e já atingiu o limite
    if (!json[body.id] && Object.keys(json).length >= maxWebhooks) {
      return NextResponse.json({ error: "Você já está usando a quantidade máxima de webhooks, entre em contato com suporte." }, { status: 400 });
    }
    if (!body.id || typeof body.id !== "string") {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    json[body.id] = body;
    await fs.writeFile(DATA_PATH, JSON.stringify(json, null, 2));
    return NextResponse.json({ success: true, data: json[body.id] });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

// DELETE: Remove um hook pelo id
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const data = await fs.readFile(DATA_PATH, "utf-8");
    const json = JSON.parse(data);
    if (!json[id]) {
      return NextResponse.json({ error: "ID não encontrado" }, { status: 404 });
    }
    delete json[id];
    await fs.writeFile(DATA_PATH, JSON.stringify(json, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}
