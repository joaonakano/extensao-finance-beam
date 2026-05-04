import { ElectronAPI } from '@electron-toolkit/preload'
import { IApi } from '../renderer/src/env'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IApi
  }
}
