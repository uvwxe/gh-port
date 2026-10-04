export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(null, { status: 405 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!stripeKey || !priceId) {
    return new Response(JSON.stringify({ error: 'stripe not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = (await req.json()) as { userId?: string };
  const origin = req.headers.get('origin') || 'http://localhost:3000';

  const session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'mode': 'subscription',
      'payment_method_types[]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': `${origin}/#upgraded=true`,
      'cancel_url': `${origin}/#pricing`,
      ...(body.userId ? { 'client_reference_id': body.userId } : {}),
    }),
  });

  const data = await session.json() as { url?: string; error?: { message: string } };

  if (data.error) {
    return new Response(JSON.stringify({ error: data.error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ url: data.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
