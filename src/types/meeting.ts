export type MeetingAnalysisStatus = 'pendente' | 'processando' | 'processada' | 'erro'

export const MEETING_STATUS_LABELS: Record<MeetingAnalysisStatus, string> = {
  pendente: 'Pendente',
  processando: 'Processando',
  processada: 'Processada',
  erro: 'Erro',
}

export interface Meeting {
  id: string
  userId: string
  title: string
  meetingDate: string
  meetingTime: string
  participants: string[]
  leadIds: string[]
  minutes: string
  observations: string | null
  status: MeetingAnalysisStatus
  analysisSummary: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export type MeetingInput = Omit<
  Meeting,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status' | 'analysisSummary' | 'errorMessage'
>
