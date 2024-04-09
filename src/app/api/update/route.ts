'use server'

import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { id, payload } = await request.json();

  if (id === null) {
    return NextResponse.json({
      success: false,
      message: 'Invalid form data'
    }, { status: 400 })
  }

  const { rows } = await sql`UPDATE family_tree SET payload = ${JSON.stringify(payload)}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ${id} RETURNING *`;

  return NextResponse.json({
    id: rows[0].id
  })


}
