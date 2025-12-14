import { NextRequest, NextResponse } from 'next/server';
import { getMenuFromFirestore, getRestaurantByIdFromFirestore } from '@/lib/firestore';
import { saveMenuToFirestore } from '@/lib/firestore';
import { revalidatePath } from 'next/cache';
import type { MenuItem } from '@/types';

// GET - Fetch menu for a restaurant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;
    
    // Get restaurant info
    const restaurant = await getRestaurantByIdFromFirestore(restaurantId);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    // Get menu items
    const items = await getMenuFromFirestore(restaurantId);
    
    return NextResponse.json({
      restaurantId,
      restaurantName: restaurant.name,
      items
    });
  } catch (error: any) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

// POST - Save menu for a restaurant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;
    const body = await request.json();
    const { items } = body as { items: MenuItem[] };
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid menu items' },
        { status: 400 }
      );
    }
    
    // Validate items
    for (const item of items) {
      if (!item.itemName || !item.category || typeof item.price !== 'number') {
        return NextResponse.json(
          { error: `Invalid item: ${item.itemName || 'unnamed'}` },
          { status: 400 }
        );
      }
    }
    
    // Save to Firestore
    await saveMenuToFirestore(restaurantId, items);
    
    // Revalidate paths
    revalidatePath(`/restaurants/${restaurantId}`);
    revalidatePath('/restaurants');
    revalidatePath('/');
    
    return NextResponse.json({
      success: true,
      message: 'Menu saved successfully',
      itemCount: items.length
    });
  } catch (error: any) {
    console.error('Error saving menu:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save menu' },
      { status: 500 }
    );
  }
}
