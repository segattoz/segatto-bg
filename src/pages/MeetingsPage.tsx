import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MeetingStatusBadge } from '@/components/ui/Badge'
import { NewMeetingDialog } from '@/components/meetings/NewMeetingDialog'
import { formatDate } from '@/lib/format'
import { useMeetings } from '@/hooks/useMeetings'
import { useLeads } from '@/hooks/useLeads'

export function MeetingsPage() {
  const meetings = useMeetings()
  const leads = useLeads()
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)

  const leadNameById = new Map(leads.map((l) => [l.id, l.fullName]))

  const sorted = [...meetings].sort((a, b) => b.meetingDate.localeCompare(a.meetingDate))

  return (
    <div>
      <PageHeader
        title="Reuniões"
        subtitle="Registre atas e envie o áudio da reunião para reorganizar seus leads de seguro de vida."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setDialogOpen(true)}>
            Nova reunião
          </Button>
        }
      />

      <div className="space-y-3 p-4 sm:p-8">
        {sorted.map((meeting, i) => (
          <Card
            key={meeting.id}
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            className="animate-fade-in-up cursor-pointer p-4 transition-colors hover:border-ink-200 dark:hover:border-ink-700 sm:p-5"
            onClick={() => navigate(`/reunioes/${meeting.id}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-ink-900 dark:text-white">{meeting.title}</h3>
                  <MeetingStatusBadge status={meeting.status} />
                </div>
                <p className="mt-1 text-sm text-ink-400">
                  {formatDate(meeting.meetingDate)} às {meeting.meetingTime}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {meeting.leadIds.map((id) => (
                    <span
                      key={id}
                      className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-300"
                    >
                      {leadNameById.get(id) ?? 'Lead removido'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs text-ink-400">
                <Users className="h-3.5 w-3.5" />
                {meeting.participants.length}
              </div>
            </div>
          </Card>
        ))}

        {sorted.length === 0 && (
          <p className="py-12 text-center text-sm text-ink-400">Nenhuma reunião registrada ainda.</p>
        )}
      </div>

      <NewMeetingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(meeting) => {
          setDialogOpen(false)
          navigate(`/reunioes/${meeting.id}`)
        }}
      />
    </div>
  )
}
