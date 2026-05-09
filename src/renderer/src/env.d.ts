/// <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload'
import { Api } from "@shared/ipc"

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}

export {}