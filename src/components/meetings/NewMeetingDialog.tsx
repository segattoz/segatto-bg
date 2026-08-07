import { useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { useLeads } from '@/hooks/useLeads'
import { getCrmService } from '@/services/crmService'
import type { Meeting } from '@/types'

const crmService = getCrmService()

export function NewMeetingDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (meeting: Meeting) => void
}) {
  const leads = useLeads()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('10:00')
  const [participants, setParticipants] = useState('')
  const [minutes, setMinutes] = useState('')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  function toggleLead(id: string) {
    setSelectedLeads((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    const meeting = await crmService.createMeeting({
      title,
      meetingDate: date,
      meetingTime: time,
      participants: participants
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      leadIds: selectedLeads,
      minutes,
      observations: null,
    })
    setSaving(false)
    onCreated(meeting)
    setTitle('')
    setParticipants('')
    setMinutes('')
    setSelectedLeads([])
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova reunião" width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reunião comercial - Empresa X" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="time">Horário</Label>
            <Input id="time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div>
          <Label htmlFor="participants">Participantes (separados por vírgula)</Label>
          <Input
            id="participants"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="Matheus Segatto, João Silva"
          />
        </div>

        <div>
          <Label>Leads envolvidos</Label>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-ink-200 p-2 dark:border-ink-700">
            {leads.map((lead) => (
              <label
                key={lead.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
              >
                <input
                  type="checkbox"
                  checked={selectedLeads.includes(lead.id)}
                  onChange={() => toggleLead(lead.id)}
                  className="h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-400 dark:border-ink-600 dark:bg-ink-800"
                />
                {lead.companyName}
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="minutes">Ata da reunião</Label>
          <Textarea
            id="minutes"
            rows={4}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Resumo do que foi discutido na reunião..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} disabled={!title || selectedLeads.length === 0}>
            Criar reunião
          </Button>
        </div>
      </form>
    </Modal>
  )
}
