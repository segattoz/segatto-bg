export const ACCEPTED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg'] as const

export const ACCEPTED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/ogg',
  'audio/webm',
] as const

export function isAcceptedAudioFile(file: File): boolean {
  const name = file.name.toLowerCase()
  if (ACCEPTED_AUDIO_EXTENSIONS.some((ext) => name.endsWith(ext))) return true
  return (ACCEPTED_AUDIO_MIME_TYPES as readonly string[]).includes(file.type)
}

/** Reads a File/Blob and resolves with its raw Base64 payload (no data: prefix). */
export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1] ?? ''
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler o arquivo de áudio'))
    reader.readAsDataURL(file)
  })
}

/** Reads audio duration in seconds by loading it into a hidden <audio> element. */
export function getAudioDuration(file: Blob): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio()
    const cleanup = () => URL.revokeObjectURL(url)

    audio.addEventListener('loadedmetadata', () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : null
      cleanup()
      resolve(duration)
    })
    audio.addEventListener('error', () => {
      cleanup()
      resolve(null)
    })
    audio.src = url
  })
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
