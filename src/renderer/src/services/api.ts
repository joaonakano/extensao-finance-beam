import type { IPCResponse } from '../env'

/** Unwraps IPCResponse<T>, throwing on failure */
export async function handleApi<T>(promise: Promise<IPCResponse<T>>): Promise<T> {
  const res = await promise
  if (!res.success) throw new Error(res.error)
  return res.data
}
