import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Forward to the canonical claim endpoint
  const url = new URL(`/api/issues/${id}/claim`, req.url)
  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      authorization: req.headers.get('authorization') || '',
      cookie: req.headers.get('cookie') || '',
      'content-type': 'application/json',
    },
  }).then(async (res) => {
    const body = await res.json()
    return NextResponse.json(body, { status: res.status })
  })
}