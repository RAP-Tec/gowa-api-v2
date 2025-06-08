export interface Instance {
  instanceName: string
  instanceId?: string
  status: "connected" | "disconnected" | "connecting"
  number?: string
}

