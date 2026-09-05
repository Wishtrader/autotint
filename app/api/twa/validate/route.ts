import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

function validateInitData(initData: string, botToken: string): boolean {
  const data = Object.fromEntries(new URLSearchParams(initData))
  const hash = data.hash
  if (!hash) return false

  // Remove hash from data for verification
  const { hash: _, ...rest } = data

  // Sort and build check string
  const checkString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join('\n')

  // Compute HMAC-SHA256
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const hmac = createHmac('sha256', secret).update(checkString).digest('hex')

  return hmac === hash
}

export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { initData } = body

    if (!initData) {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 })
    }

    const valid = validateInitData(initData, BOT_TOKEN)

    if (!valid) {
      return NextResponse.json({ error: 'Invalid initData' }, { status: 403 })
    }

    // Parse user from initData
    const data = Object.fromEntries(new URLSearchParams(initData))
    const userRaw = data.user
    if (!userRaw) {
      return NextResponse.json({ error: 'No user in initData' }, { status: 400 })
    }

    const user = JSON.parse(userRaw)

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        phone_number: user.phone_number || null,
      },
    })
  } catch (e) {
    console.error('[TWA Validate]', e)
    return NextResponse.json({ error: 'Validation error' }, { status: 500 })
  }
}
