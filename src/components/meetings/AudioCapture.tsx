import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Mic, Square, Upload, FileAudio, X, Sparkles } from 'lucide-react'
import { Button, Spinner } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import {
  getAudioDuration,
  formatDuration,
  formatFileSize,
  isAcceptedAudioFile,
  ACCEPTED_AUDIO_EXTENSIONS,
} from '@/lib/audio'

interface SelectedAudio {
  blob: Blob
  filename: string
  mimeType: string
  size: number
  duration: number | null
}

export function AudioCapture({
  onAnalyze,
  analyzing,
}: {
  onAnalyze: (audio: { file: Blob; filename: string; mimeType: string }) => void
  analyzing: boolean
}) {
  const [audio, setAudio] = useState<SelectedAudio | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function selectAudio(blob: Blob, filename: string, mimeType: string) {
    const duration = await getAudioDuration(blob)
    setAudio({ blob, filename, mimeType, size: blob.size, duration })
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!isAcceptedAudioFile(file)) {
      setError(`Formato não suportado. Use: ${ACCEPTED_AUDIO_EXTENSIONS.join(', ')}`)
      return
    }
    setError(null)
    await selectAudio(file, file.name, file.type || 'audio/mpeg')
  }

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        stream.getTracks().forEach((track) => track.stop())
        void selectAudio(blob, `gravacao-${Date.now()}.webm`, blob.type)
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingSeconds(0)
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000)
    } catch {
      setError('Não foi possível acessar o microfone. Verifique as permissões do navegador.')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function clearAudio() {
    setAudio(null)
    setError(null)
  }

  if (audio) {
    return (
      <div className="animate-fade-in-up rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-900 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 sm:h-12 sm:w-12">
            <FileAudio className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{audio.filename}</p>
            <p className="text-xs text-ink-400">
              {formatDuration(audio.duration)} · {formatFileSize(audio.size)}
            </p>
          </div>
          {!analyzing && (
            <button
              onClick={clearAudio}
              className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          className="mt-5 w-full"
          size="lg"
          loading={analyzing}
          icon={!analyzing ? <Sparkles className="h-4 w-4" /> : undefined}
          onClick={() => onAnalyze({ file: audio.blob, filename: audio.filename, mimeType: audio.mimeType })}
        >
          {analyzing ? 'Analisando reunião e reorganizando seus leads…' : 'Analisar reunião'}
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/50 p-5 text-center dark:border-ink-700 dark:bg-ink-800/30 sm:p-8">
      {isRecording ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-negative-50 dark:bg-negative-500/15">
            <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-negative-400 opacity-20" />
            <Mic className="h-7 w-7 text-negative-500 dark:text-negative-400" />
          </div>
          <p className="font-mono text-lg font-semibold text-ink-900 dark:text-white">{formatDuration(recordingSeconds)}</p>
          <Button variant="danger" icon={<Square className="h-3.5 w-3.5" />} onClick={stopRecording}>
            Parar gravação
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 py-4">
          <div>
            <p className="text-base font-semibold text-ink-900 dark:text-white">Envie sua percepção sobre a reunião</p>
            <p className="mt-1 text-sm text-ink-400">Grave um áudio ou envie um arquivo — só isso, o resto o sistema resolve.</p>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button size="lg" className="w-full sm:w-auto" icon={<Mic className="h-4 w-4" />} onClick={() => void startRecording()}>
              Gravar áudio
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
              icon={<Upload className="h-4 w-4" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Enviar arquivo de áudio
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={[...ACCEPTED_AUDIO_EXTENSIONS, 'audio/*'].join(',')}
              className="hidden"
              onChange={(e) => void handleFileChange(e)}
            />
          </div>

          <p className="text-xs text-ink-400">Formatos aceitos: {ACCEPTED_AUDIO_EXTENSIONS.join(', ')}</p>
        </div>
      )}

      {error && <p className={cn('mt-4 text-sm text-negative-600 dark:text-negative-400')}>{error}</p>}
    </div>
  )
}

export function AnalyzingOverlay() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-ink-100 bg-white py-12 dark:border-ink-800 dark:bg-ink-900">
      <Spinner className="h-6 w-6 text-brand-500" />
      <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Analisando reunião e reorganizando seus leads…</p>
      <p className="text-xs text-ink-400">Isso pode levar alguns segundos.</p>
    </div>
  )
}
