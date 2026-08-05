import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth-check';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'rentals.json');
const COOKIE_NAME = 'jn_session';

function isAuthenticated(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value ?? '';
  return !!verifySessionToken(token);
}

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    return NextResponse.json(JSON.parse(fileContents));
  } catch {
    return NextResponse.json({ error: 'Failed to read rentals data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const newItem = await request.json();
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const items = JSON.parse(fileContents);
    newItem.id = Date.now().toString();
    items.push(newItem);
    await fs.writeFile(dataFilePath, JSON.stringify(items, null, 2), 'utf8');
    return NextResponse.json(newItem, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to save rentals data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const items = (JSON.parse(fileContents) as { id: string }[]).filter((e) => e.id !== id);
    await fs.writeFile(dataFilePath, JSON.stringify(items, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete rental item' }, { status: 500 });
  }
}
