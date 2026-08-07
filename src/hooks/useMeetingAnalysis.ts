import { useState } from 'react'
import type { Lead, Meeting, MeetingAnalysisResult } from '@/types'
import { fileToBase64 } from '@/lib/audio'
import { buildAnalysisRequest, analyzeMeeting } from '@/services/n8n'
import { getCrmService } from '@/services/crmService'

const crmService = getCrmService()

type Phase = 'idle' | 'processing' | 'done' | 'error'

interface AudioSelection {
  file: Blob
  filename: string
  mimeType: string
}

export function useMeetingAnalysis(meeting: Meeting, involvedLeads: Lead[]) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<MeetingAnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function run(audio: AudioSelection) {
    setPhase('processing')
    setErrorMessage(null)
    try {
      await crmService.updateMeeting(meeting.id, { status: 'processando', errorMessage: null })

      const base64 = await fileToBase64(audio.file)
      const request = buildAnalysisRequest(meeting, involvedLeads, {
        filename: audio.filename,
        mimeType: audio.mimeType,
        base64,
      })

      const response = await analyzeMeeting(request)
      const applied = await crmService.applyMeetingAnalysis(meeting.id, response)

      setResult(applied)
      setPhase('done')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha inesperada ao processar a reunião'
      setErrorMessage(message)
      await crmService.updateMeeting(meeting.id, { status: 'erro', errorMessage: message })
      setPhase('error')
    }
  }

  function reset() {
    setPhase('idle')
    setResult(null)
    setErrorMessage(null)
  }

  return { phase, result, errorMessage, run, reset }
}
