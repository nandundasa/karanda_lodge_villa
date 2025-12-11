import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'slides.json');

export async function GET() {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  fs.writeFileSync(dataPath, JSON.stringify(body, null, 2));
  return NextResponse.json({ success: true });
}
