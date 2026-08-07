import { useCrmStore } from '@/store/crmStore'
import type { Meeting } from '@/types'

export function useMeetings(): Meeting[] {
  return useCrmStore((state) => state.meetings)
}

export function useMeeting(id: string | undefined): Meeting | null {
  return useCrmStore((state) => state.meetings.find((meeting) => meeting.id === id) ?? null)
}
