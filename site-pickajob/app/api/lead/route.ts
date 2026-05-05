import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const employerSchema = z.object({
  nom: z.string().min(2),
  entreprise: z.string().min(2),
  telephone: z.string().min(8),
  email: z.string().email(),
  localisation: z.string().min(2),
  culture: z.string().min(2),
  nombre: z.coerce.number().int().min(1),
  dates: z.string().min(2),
  logement: z.enum(['oui', 'non']),
  message: z.string().optional(),
  hp: z.string().optional(),
});

const candidateSchema = z.object({
  nom: z.string().min(2),
  prenom: z.string().min(2),
  telephone: z.string().min(8),
  email: z.string().email(),
  pays: z.string().min(2),
  langues: z.string().min(2),
  experience: z.string().min(2),
  disponibilite: z.string().min(2),
  mobilite: z.string().min(2),
  logement: z.enum(['oui', 'non']),
  hp: z.string().optional(),
});

const body = z.discriminatedUnion('type', [
  z.object({ type: z.literal('employer'), payload: employerSchema }),
  z.object({ type: z.literal('candidate'), payload: candidateSchema }),
]);

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }

  if (parsed.data.payload.hp) {
    return NextResponse.json({ ok: true });
  }

  const ts = new Date().toISOString();
  const log = {
    ts,
    type: parsed.data.type,
    payload: { ...parsed.data.payload, hp: undefined },
  };

  console.log('[pickajob:lead]', JSON.stringify(log));

  const webhook = process.env.PICKAJOB_LEAD_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch (err) {
      console.error('[pickajob:lead] webhook error', err);
    }
  }

  return NextResponse.json({ ok: true });
}
