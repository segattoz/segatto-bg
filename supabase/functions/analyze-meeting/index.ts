// Supabase Edge Function: analyze-meeting
//
// Proxies the meeting analysis request to the n8n webhook so the webhook
// URL (and any auth secret) never has to reach the browser. Deploy with:
//
//   supabase functions deploy analyze-meeting
//   supabase secrets set N8N_ANALYZE_MEETING_WEBHOOK=https://.../webhook/xxx
//
// Then set VITE_USE_EDGE_FUNCTION_PROXY=true in the frontend .env so
// src/services/n8n.ts calls this function via supabase.functions.invoke
// instead of hitting the webhook directly.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const N8N_WEBHOOK = Deno.env.get('N8N_ANALYZE_MEETING_WEBHOOK')

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  if (!N8N_WEBHOOK) {
    return new Response(JSON.stringify({ error: 'N8N_ANALYZE_MEETING_WEBHOOK is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verify the caller is an authenticated user of this Supabase project.
  const authHeader = req.headers.get('Authorization')
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader ?? '' } } },
  )
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await req.text()

  const n8nResponse = await fetch(N8N_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  const text = await n8nResponse.text()
  return new Response(text, {
    status: n8nResponse.status,
    headers: { 'Content-Type': 'application/json' },
  })
})
