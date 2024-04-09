"use server"

import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { name, payload } = await request.json();

  if (name === null) {
    return NextResponse.json({
      success: false,
      message: "Invalid form data"
    }, { status: 400 })
  }

  const { rows } = await sql`INSERT INTO family_tree (name, payload) VALUES (${name.toString()}, ${JSON.stringify(payload)}) RETURNING *`;

  return NextResponse.json({
    id: rows[0].id
  })


}
