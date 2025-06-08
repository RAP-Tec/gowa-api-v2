"use server"

import { evolutionApi } from "@/lib/evolution-api"
import type { Instance } from "@/lib/types"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Função para listar instâncias
export async function listInstances(): Promise<ApiResponse<Instance[]>> {
  try {
    return await evolutionApi.listInstances()
  } catch (error) {
    console.error("Erro ao listar instâncias:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Função para criar uma nova instância
export async function createInstance(instanceName: string, number?: string): Promise<ApiResponse> {
  try {
    // Validar formato do nome da instância
    if (!/^[a-z0-9-]+$/.test(instanceName)) {
      return {
        success: false,
        error: "instanceName must contain only lowercase letters, numbers and hyphens",
      }
    }

    // Validar formato do número, se fornecido
    if (number && !/^\d+$/.test(number)) {
      return {
        success: false,
        error: "Phone number must contain only numbers",
      }
    }

    return await evolutionApi.createInstance(instanceName, number)
  } catch (error) {
    console.error("Erro ao criar instância:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Função para obter QR Code de uma instância
export async function getInstanceQrCode(
  instanceName: string,
): Promise<ApiResponse<{ qrcode?: string; base64?: string; pairingCode?: string }>> {
  try {
    return await evolutionApi.getQrCode(instanceName)
  } catch (error) {
    console.error("Erro ao obter QR Code:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Função para desconectar uma instância
export async function disconnectInstance(instanceName: string): Promise<ApiResponse> {
  try {
    return await evolutionApi.disconnectInstance(instanceName)
  } catch (error) {
    console.error("Erro ao desconectar instância:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Função para deletar uma instância
export async function deleteInstance(instanceIdOrName: string): Promise<ApiResponse> {
  try {
    return await evolutionApi.deleteInstance(instanceIdOrName)
  } catch (error) {
    console.error("Erro ao deletar instância:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

