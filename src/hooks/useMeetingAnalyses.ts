import { useMemo } from 'react'
import { useCrmStore } from '@/store/crmStore'
import type { LeadAnalysis } from '@/types'

export function useMeetingAnalyses(meetingId: string | undefined): LeadAnalysis[] {
  const analyses = useCrmStore((state) => state.analyses)
  return useMemo(
    () =>
      meetingId
        ? analyses.filter((a) => a.meetingId === meetingId).sort((a, b) => a.priority - b.priority)
        : [],
    [analyses, meetingId],
  )
}
