export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(null, { status: 405 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return new Response(null, { status: 400 });
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const parts = sig.split(',');
    const ts = parts[0].split('=')[1];
    const sigVal = parts[1].split('=')[1];
    const signedPayload = `${ts}.${body}`;

    const valid = await crypto.subtle.verify(
      'HMAC',
      key as CryptoKey,
      hexToBytes(sigVal) as BufferSource,
      encoder.encode(signedPayload) as BufferSource
    );

    if (!valid) {
      return new Response(null, { status: 400 });
    }

    const event = JSON.parse(body);
    if (event.type === 'checkout.session.completed') {
      console.log('User upgraded:', event.data.object.client_reference_id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(null, { status: 400 });
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
