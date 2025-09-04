// Biblioteca auxiliar para interagir com a API Evolution

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  steps?: string
}

interface Instance {
  instanceName: string
  instanceId?: string
  status: "connected" | "disconnected" | "connecting"
  number?: string
  // Novos campos adicionados
  ownerJid?: string
  profileName?: string
  profilePicUrl?: string
  token?: string // Assumindo que 'token' vem da API, se for o 'hash' da criação, já está em createInstance
  disconnectionReasonCode?: string
  disconnectionObject?: any // Pode ser um objeto com detalhes
  disconnectionAt?: string // Ou Date? Depende do formato da API
  createdAt?: string // Ou Date? Depende do formato da API
}

// URL base da API Evolution
const API_BASE_URL = process.env.GOWA_API_URL || "http://localhost:8080"
const API_KEY = process.env.GOWA_API_KEY || ""

// Função auxiliar para fazer requisições à API
async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}, apiKey?: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    "Content-Type": "application/json",
    apikey: apiKey || API_KEY, // Usa a API key passada como parâmetro ou a do environment
    ...options.headers,
  }

//  console.log(`Fazendo requisição para: ${url}`)

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    // console.error(`Erro na API (${response.status}):`, errorText)

    try {
      const errorJson = JSON.parse(errorText)
      throw new Error(errorJson.message || errorJson.error || `Erro ${response.status}`)
    } catch (e) {
      throw new Error(`Erro ${response.status}: ${errorText}`)
    }
  }

  return response.json()
}

// Objeto com métodos para interagir com a API Evolution
export const evolutionApi = {
  // Listar instâncias
  async listInstances(apiKey?: string): Promise<ApiResponse<Instance[]>> {
    try {
      const response = await fetchFromApi<any>("/instance/fetchInstances", {}, apiKey)
//      console.log("Resposta da API /instance/fetchInstances:", JSON.stringify(response, null, 2)) // Log detalhado

      let instances: Instance[] = []

      // Função auxiliar para mapear um item da API para nossa interface Instance
      const mapApiItemToInstance = (item: any, key?: string): Instance => ({
        instanceName: item.instanceName || item.name || key || "unknown",
        instanceId: item.instanceId || item.id || item.instanceName || item.name || key || "unknown",
        status: mapStatusFromApi(item.status || item.connectionStatus || "disconnected"),
        number: item.number || undefined,
        // Mapeamento dos novos campos
        ownerJid: item.owner || item.ownerJid || undefined,
        profileName: item.profileName || undefined,
        profilePicUrl: item.profilePictureUrl || item.profilePicUrl || undefined,
        token: item.token || item.apikey || undefined, // Verificar qual campo a API retorna para o token
        disconnectionReasonCode: item.disconnectionReason || item.disconnectionReasonCode || undefined,
        disconnectionObject: item.disconnectionObject || undefined, // Ajustar se a API retornar um objeto específico
        disconnectionAt: item.disconnectedAt || item.disconnectionAt || undefined, // Ajustar formato se necessário
        createdAt: item.createdAt || undefined, // Ajustar formato se necessário
      });

      // Verificar se a resposta é um array (formato observado nos logs)
      if (Array.isArray(response)) {
         // Adaptação para o formato [{ instance: {...} }] que parece ser comum
         if (response.length > 0 && response[0].instance) {
            instances = response.map((entry: any) => mapApiItemToInstance(entry.instance));
         } else {
            // Mapeamento direto se for um array de instâncias
            instances = response.map((item: any) => mapApiItemToInstance(item));
         }
      }
      // Verificar outros formatos possíveis (como o de /instance/create)
      else if (response.instance && typeof response.instance === 'object') {
         // Se a resposta for similar à de /instance/create, mapeia o objeto 'instance'
         instances = [mapApiItemToInstance(response.instance)];
      }
      // Formato de objeto com chaves como nomes de instância
      else if (typeof response === "object" && response !== null) {
        instances = Object.entries(response).map(([key, value]: [string, any]) => mapApiItemToInstance(value, key));
      }

//      console.log("Instâncias mapeadas:", instances)
      return {
        success: true,
        data: instances,
      }
    } catch (error) {
      // console.error("Erro ao listar instâncias:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Verificar se uma instância já existe
  async instanceExists(instanceName: string, apiKey?: string): Promise<boolean> {
    try {
      const response = await this.listInstances(apiKey)

      if (response.success && response.data) {
        return response.data.some((instance) => instance.instanceName.toLowerCase() === instanceName.toLowerCase())
      }

      return false
    } catch (error) {
      // console.error("Erro ao verificar existência da instância:", error)
      return false
    }
  },

  // Criar instância
  async createInstance(
    apiKey?: string,
    instanceName: string, 
    number?: string, 
    options?: {
      rejectCall?: boolean,
      msgCall?: string,
      groupsIgnore?: boolean,
      alwaysOnline?: boolean,
      readMessages?: boolean,
      readStatus?: boolean,
      syncFullHistory?: boolean,
      proxyHost?: string,
      proxyPort?: string,
      proxyProtocol?: string,
      proxyUsername?: string,
      proxyPassword?: string
    }
  ): Promise<ApiResponse> {
    try {
      // Verificar se a instância já existe pelo nome
      const existsByName = await this.instanceExists(instanceName, apiKey)
      if (existsByName) {
        return {
          success: false,
          error: "An instance with this name already exists",
        }
      }

      // Verificar se o número já existe (se fornecido)
      if (number) {
        const existsByNumber = await this.getInstanceDetailsByNumber(number, apiKey);
        if (existsByNumber.exists) {
          return {
            success: false,
            error: `An instance with the number ${number} already exists (Instance Name: ${existsByNumber.instanceName})`,
          }
        }
      }
  
      // Payload com campos essenciais e opcionais
      const payload = {
        instanceName,
        name: instanceName, // Adicionando campo name como backup
        integration: "WHATSAPP-BAILEYS", // Campo obrigatório
        qrcode: true,
        ...(number && { number }),
        // Adicionar campos opcionais se fornecidos
        ...(options?.rejectCall !== undefined && { rejectCall: options.rejectCall }),
        ...(options?.msgCall !== undefined && { msgCall: options.msgCall }),
        ...(options?.groupsIgnore !== undefined && { groupsIgnore: options.groupsIgnore }),
        ...(options?.alwaysOnline !== undefined && { alwaysOnline: options.alwaysOnline }),
        ...(options?.readMessages !== undefined && { readMessages: options.readMessages }),
        ...(options?.readStatus !== undefined && { readStatus: options.readStatus }),
        ...(options?.syncFullHistory !== undefined && { syncFullHistory: options.syncFullHistory }),
        ...(options?.proxyHost && { proxyHost: options.proxyHost }),
        ...(options?.proxyPort && { proxyPort: options.proxyPort }),
        ...(options?.proxyProtocol && { proxyProtocol: options.proxyProtocol }),
        ...(options?.proxyUsername && { proxyUsername: options.proxyUsername }),
        ...(options?.proxyPassword && { proxyPassword: options.proxyPassword }),
      }
  
//      console.log("Payload para criação de instância:", JSON.stringify(payload))

      // Tipagem explícita da resposta esperada da API
      const response = await fetchFromApi<{
        instance: {
          instanceName: string
          instanceId: string // Esperamos instanceId aqui
          status: string
          owner?: string // Adicionar campos que podem vir na criação
          createdAt?: string // Adicionar campos que podem vir na criação
        }
        hash: string // Este é o token/apikey da instância
        qrcode?: {
          pairingCode?: string
          code?: string
          base64?: string
        }
      }>("/instance/create", {
        method: "POST",
        body: JSON.stringify(payload),
      }, apiKey)

      // Verifica se a resposta contém os dados esperados
      if (!response || !response.instance || !response.instance.instanceId || !response.hash) {
        // console.error("Resposta da API /instance/create inválida:", response);
        throw new Error("Invalid API response when creating instance");
      }

      return {
        success: true,
        message: "Device Instance created successfully",
        version: '2.3.5',
        steps: "Send the QR Code or Pairing Code to the customer and ask them to read it within 30 seconds",
        data: {
          instanceName: response.instance.instanceName,
          instanceId: response.instance.instanceId, // Usar o instanceId retornado
          number: number || null,
          createdAt: response.instance.createdAt || new Date().toISOString(),
          token: response.hash,
          ownerJid: response.instance.owner,
          status: mapStatusFromApi(response.instance.status || "connecting"),
        }
      }
    } catch (error) {
      // console.error("Erro ao criar instância:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Obter QR Code
  async getQrCode(
    instanceName: string,
    apiKey?: string
  ): Promise<ApiResponse<{ qrcode?: string; base64?: string; pairingCode?: string }>> {
    try {
      const response = await fetchFromApi<any>(`/instance/connect/${instanceName}`, {}, apiKey)

     // console.log("Resposta do QR Code:", JSON.stringify(response, null, 2))

      let qrcode = null
      let pairingCode = null

      if (response.qrcode) {
        qrcode = response.qrcode
      } else if (response.base64) {
        qrcode = response.base64
      } else if (response.data && response.data.qrcode) {
        qrcode = response.data.qrcode
      } else if (response.data && response.data.base64) {
        qrcode = response.data.base64
      }

      if (response.pairingCode) {
        pairingCode = response.pairingCode
      } else if (response.data && response.data.pairingCode) {
        pairingCode = response.data.pairingCode
      } else {
        pairingCode = "To use the pairingCode, disconnect from the API and request the connection via Phone number or Pairing Code on the main WhatsApp device"
      }

      return {
        success: true,
        data: {
          qrcode: qrcode,
          pairingCode: pairingCode,
        },
      }
    } catch (error) {
      // console.error("Erro ao obter QR Code:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Verificar status da instância
  async checkInstanceStatus(instanceName: string, apiKey?: string): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await fetchFromApi<any>(`/instance/connectionState/${instanceName}`, {}, apiKey)

   //   console.log("Resposta do status da instância:", JSON.stringify(response, null, 2))

      let status = "disconnected"

      if (response.state) {
        status = mapStatusFromApi(response.state)
      } else if (response.status) {
        status = mapStatusFromApi(response.status)
      } else if (response.connectionStatus) {
        status = mapStatusFromApi(response.connectionStatus)
      }

      return {
        success: true,
        data: {
          status,
        },
      }
    } catch (error) {
      // console.error("Erro ao verificar status da instância:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Desconectar instância (logout)
  async disconnectInstance(instanceName: string, apiKey?: string): Promise<ApiResponse> {
    try {
      const response = await fetchFromApi(`/instance/logout/${instanceName}`, {
        method: "DELETE",
      }, apiKey)

      return {
        success: true,
        message: "Device Instance disconnected successfully",
      }
    } catch (error) {
      // console.error("Erro ao desconectar instância:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Nova função para desconectar pelo número
  async disconnectDeviceByNumber(number: string, apiKey?: string): Promise<ApiResponse> {
    try {
//      console.log(`Tentando desconectar dispositivo com número: ${number}`)
      // 1. Encontrar a instância pelo número
      const instanceDetails = await this.getInstanceDetailsByNumber(number, apiKey)

      if (!instanceDetails.exists || !instanceDetails.instanceName) {
//        console.log(`Nenhuma instância encontrada para o número: ${number}`)
        return {
          success: false,
          error: `Device with number ${number} not found.`,
        }
      }

//      console.log(`Instância encontrada: ${instanceDetails.instanceName}. Desconectando...`)
      // 2. Chamar a função de desconexão existente com o nome da instância
      return await this.disconnectInstance(instanceDetails.instanceName, apiKey)

    } catch (error) {
      // console.error(`Erro ao desconectar dispositivo pelo número ${number}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during disconnection by number",
      }
    }
  },

  // Deletar instância
  async deleteInstance(instanceName: string, apiKey?: string): Promise<ApiResponse> {
    try {
      const response = await fetchFromApi(`/instance/delete/${instanceName}`, {
        method: "DELETE",
      }, apiKey)

      return {
        success: true,
        message: "Device Instance deleted successfully",
      }
    } catch (error) {
      // console.error("Erro ao deletar instância:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Função para deletar uma instância pelo número do dispositivo
  async deleteDeviceByNumber(number: string, apiKey?: string): Promise<ApiResponse> {
    try {
//      console.log(`Tentando deletar dispositivo com número: ${number}`)
      // 1. Encontrar a instância pelo número
      const instanceDetails = await this.getInstanceDetailsByNumber(number, apiKey)

      if (!instanceDetails.exists || !instanceDetails.instanceName) {
//        console.log(`Nenhuma instância encontrada para o número: ${number}`)
        return {
          success: false,
          error: `Device with number ${number} not found.`,
        }
      }

//      console.log(`Instância encontrada: ${instanceDetails.instanceName}. Deletando...`)
      // 2. Chamar a função de exclusão existente com o nome da instância
      return await this.deleteInstance(instanceDetails.instanceName, apiKey)

    } catch (error) {
      // console.error(`Erro ao deletar dispositivo pelo número ${number}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during deletion by number",
      }
    }
  },

  // Função para obter detalhes de uma instância específica
  async getInstanceDetails(instanceName: string, apiKey?: string): Promise<{ exists: boolean; instance?: Instance; number?: string | null; status?: string }> { // Ajustado tipo de retorno para incluir number e status
    try {
      const response = await this.listInstances(apiKey);

      if (response.success && response.data) {
        const instance = response.data.find(
          (inst) => inst.instanceName.toLowerCase() === instanceName.toLowerCase()
        );

        if (instance) {
          // Retornar a instância completa ou os detalhes necessários
          return {
            exists: true,
            instance: instance, // Retorna a instância completa
            number: instance.number || null, // Garante que number seja string ou null
            status: instance.status
          };
        }
      }

      return { exists: false };
    } catch (error) {
      // console.error("Erro ao obter detalhes da instância:", error);
      return { exists: false };
    }
  }, // <--- Vírgula adicionada

  // Obter detalhes da instância pelo número
  async getInstanceDetailsByNumber(number: string, apiKey?: string): Promise<{ exists: boolean; instanceName?: string; status?: string }> {
    try {
      const response = await this.listInstances(apiKey);

      if (response.success && response.data) {
        // Normalize the number by removing any non-digit characters
        const normalizedSearchNumber = number.replace(/\D/g, '');

        const instance = response.data.find(
          (inst) => {
            // If the instance has a number, normalize it and compare
            if (inst.number) {
              const normalizedInstNumber = inst.number.replace(/\D/g, '');
              return normalizedInstNumber === normalizedSearchNumber;
            }
            return false;
          }
        );

        if (instance) {
          return {
            exists: true,
            instanceName: instance.instanceName,
            status: instance.status
          };
        }
      }

      return { exists: false };
    } catch (error) {
      // console.error("Erro ao obter detalhes da instância pelo número:", error);
      return { exists: false };
    }
  },

  // Enviar mensagem de texto
  async sendMessage(
    instanceName: string,
    to: string,
    message: string,
    apiKey?: string
  ): Promise<ApiResponse> {
    try {
      // Função auxiliar para detectar se a mensagem contém URL
      const containsUrl = (text: string): boolean => {
        const urlRegex = /(https?:\/\/|www\.)[^\s]+/i;
        return urlRegex.test(text);
      };

      const payload = {
        number: to,
        text: message,
        linkPreview: containsUrl(message)
      };

      const response = await fetchFromApi(`/message/sendText/${instanceName}`, {
        method: "POST",
        body: JSON.stringify(payload),
      }, apiKey);

      return {
        success: true,
        message: "Message sent successfully",
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // Enviar arquivo/mídia
  async sendFile(
    instanceName: string,
    to: string,
    message: string,
    fileUrl: string,
    apiKey?: string
  ): Promise<ApiResponse> {
    try {
      // Função auxiliar para extrair nome do arquivo da URL
      const getFileName = (url: string): string => {
        try {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          const fileName = pathname.split('/').pop() || 'file';
          return fileName;
        } catch {
          return 'file';
        }
      };

      // Função auxiliar para detectar mimetype baseado na extensão do arquivo
      const getMimeType = (url: string): string => {
        const fileName = getFileName(url).toLowerCase();
        const extension = fileName.split('.').pop() || '';
        
        switch (extension) {
          case 'png':
            return 'image/png';
          case 'jpg':
          case 'jpeg':
            return 'image/jpeg';
          case 'mp4':
            return 'video/mp4';
          case 'pdf':
            return 'application/pdf';
          case 'gif':
            return 'image/gif';
          case 'webp':
            return 'image/webp';
          case 'mp3':
            return 'audio/mpeg';
          case 'wav':
            return 'audio/wav';
          case 'ogg':
            return 'audio/ogg';
          default:
            return 'application/octet-stream';
        }
      };

      // Função auxiliar para detectar mediatype baseado no mimetype
      const getMediaType = (mimeType: string): string => {
        if (mimeType.startsWith('image/')) {
          return 'image';
        } else if (mimeType.startsWith('video/')) {
          return 'video';
        } else if (mimeType.startsWith('audio/')) {
          return 'audio';
        } else {
          return 'document';
        }
      };

      const fileName = getFileName(fileUrl);
      const mimeType = getMimeType(fileUrl);
      const mediaType = getMediaType(mimeType);

      const payload = {
        number: to,
        mediatype: mediaType,
        mimetype: mimeType,
        caption: message,
        media: fileUrl,
        fileName: fileName
      };

      const response = await fetchFromApi(`/message/sendMedia/${instanceName}`, {
        method: "POST",
        body: JSON.stringify(payload),
      }, apiKey);

      return {
        success: true,
        message: "File sent successfully",
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  } // <--- SEM vírgula aqui, pois é a última função no objeto
}

// Função auxiliar para mapear o status da API para o formato esperado pelo frontend
function mapStatusFromApi(apiStatus: string): "connected" | "disconnected" | "connecting" {
  if (!apiStatus) return "disconnected"

  switch (apiStatus.toLowerCase()) {
    case "connected":
    case "online":
    case "active":
    case "open":
    case "true":
      return "connected"
    case "connecting":
    case "loading":
    case "syncing":
    case "starting":
      return "connecting"
    default:
      return "disconnected"
  }
}

