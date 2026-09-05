import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const ts = new Date().toISOString()
  try {
    const body = await request.json()
    const { name, phone, car, service, booking_date, booking_time, comment, type, telegram_user_id } = body

    console.log(`[BOOKING][${ts}] New request:`, { name, phone, car, service, booking_date, booking_time, type })

    if (!name || !phone || !car || !service) {
      console.log(`[BOOKING][${ts}] Validation failed: missing fields`, { name: !!name, phone: !!phone, car: !!car, service: !!service })
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check slot availability only if date/time provided
    if (booking_date && booking_time) {
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', booking_date)
        .eq('booking_time', booking_time)
        .eq('status', 'confirmed')
        .single()

      if (existing) {
        console.log(`[BOOKING][${ts}] Slot already booked:`, { booking_date, booking_time })
        return NextResponse.json(
          { error: 'Этот слот уже занят. Выберите другое время.' },
          { status: 409 }
        )
      }
    }

    // Create booking
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        name,
        phone,
        car,
        service,
        booking_date: booking_date || null,
        booking_time: booking_time || null,
        comment: comment || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error(`[BOOKING][${ts}] DB insert error:`, error)
      return NextResponse.json(
        { error: 'Ошибка при создании записи' },
        { status: 500 }
      )
    }

    console.log(`[BOOKING][${ts}] Created:`, { id: data.id, name, booking_date, booking_time })

    // Send Telegram notification (blocking — Vercel kills function after response)
    try {
      const telegramUrl = new URL('/api/telegram', request.url)
      const tgRes = await fetch(telegramUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type === 'inquiry' ? 'new_inquiry' : 'new_booking',
          booking: data,
        }),
      })
      console.log(`[BOOKING][${ts}] Telegram sent:`, tgRes.status)
    } catch (e) {
      console.error(`[BOOKING][${ts}] Telegram failed:`, e)
    }

    // Send confirmation to TWA user
    if (telegram_user_id && type !== 'inquiry') {
      try {
        const telegramUrl = new URL('/api/telegram', request.url)
        await fetch(telegramUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'booking_confirmed',
            booking: data,
            telegram_user_id,
          }),
        })
      } catch (e) {
        console.error(`[BOOKING][${ts}] User confirmation failed:`, e)
      }
    }

    return NextResponse.json({ booking: data }, { status: 201 })
  } catch (e) {
    console.error(`[BOOKING][${ts}] Fatal error:`, e)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, admin_note } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const update: Record<string, string> = {}
    if (status) update.status = status
    if (admin_note !== undefined) update.admin_note = admin_note

    const { data, error } = await supabase
      .from('bookings')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    // Send Telegram notification on status change (blocking)
    if (status) {
      try {
        const telegramUrl = new URL('/api/telegram', request.url)
        await fetch(telegramUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'status_changed', booking: data }),
        })
      } catch {}
    }

    return NextResponse.json({ booking: data })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('bookings').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    const date = searchParams.get('date')
    const status = searchParams.get('status')

    const id = searchParams.get('id')

    // Single booking by ID
    if (id) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      return NextResponse.json({ booking: data })
    }

    let query = supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true })

    if (date) {
      query = query.eq('booking_date', date)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Ошибка при получении записей' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings: data })
  } catch {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
