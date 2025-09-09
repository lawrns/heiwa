import { NextRequest, NextResponse } from 'next/server';
import { clientsAPI } from '@/lib/supabase-admin';
import { requireAdminSession } from '@/lib/auth';
import { CreateClientSchema, UpdateClientSchema } from '@/lib/clients/schema';

// GET /api/firebase-clients - Get all clients
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request);

    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const status = searchParams.get('status');

    let clients;
    if (brand || status) {
      // Get all clients and filter client-side for now
      // In production, you might want to add server-side filtering
      clients = await clientsAPI.getAll();
      if (brand) {
        clients = clients.filter(c => (c as any).brand === brand || brand === 'Heiwa House'); // Default to Heiwa House for legacy data
      }
      if (status) {
        clients = clients.filter(c => c.status === status);
      }
    } else {
      clients = await clientsAPI.getAll();
    }

    return NextResponse.json({ clients });
  } catch (error: any) {
    console.error('Get clients error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch clients' },
      { status: error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

// POST /api/firebase-clients - Create new client
export async function POST(request: NextRequest) {
  try {
    await requireAdminSession(request);

    const body = await request.json();
    const validatedData = CreateClientSchema.parse(body);

    const clientId = await clientsAPI.create(validatedData);
    const client = await clientsAPI.getById(clientId);

    return NextResponse.json({ client }, { status: 201 });
  } catch (error: any) {
    console.error('Create client error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create client' },
      { status: error.message.includes('Authentication') ? 401 : 400 }
    );
  }
}

// PUT /api/firebase-clients - Update client
export async function PUT(request: NextRequest) {
  try {
    await requireAdminSession(request);

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const validatedUpdates = UpdateClientSchema.parse(updates);
    await clientsAPI.update(id, validatedUpdates);

    const client = await clientsAPI.getById(id);
    return NextResponse.json({ client });
  } catch (error: any) {
    console.error('Update client error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update client' },
      { status: error.message.includes('Authentication') ? 401 : 400 }
    );
  }
}

// DELETE /api/firebase-clients - Delete client
export async function DELETE(request: NextRequest) {
  try {
    await requireAdminSession(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    await clientsAPI.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete client error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete client' },
      { status: error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}
