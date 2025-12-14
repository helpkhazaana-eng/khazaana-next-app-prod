import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantByIdFromFirestore } from '@/lib/firestore';
import { restaurants as staticRestaurants } from '@/data/restaurants';

// GET - Fetch restaurant open status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;
    
    // Try Firestore first
    const firestoreRestaurant = await getRestaurantByIdFromFirestore(restaurantId);
    
    if (firestoreRestaurant) {
      return NextResponse.json({
        restaurantId,
        name: firestoreRestaurant.name,
        isOpen: firestoreRestaurant.isOpen, // true, false, or undefined
        adminStatus: firestoreRestaurant.adminStatus
      });
    }
    
    // Fallback to static restaurants
    const staticRestaurant = staticRestaurants.find(r => r.id === restaurantId);
    
    if (staticRestaurant) {
      return NextResponse.json({
        restaurantId,
        name: staticRestaurant.name,
        isOpen: undefined, // Static restaurants use default time-based rules
        adminStatus: 'live'
      });
    }
    
    return NextResponse.json(
      { error: 'Restaurant not found' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error fetching restaurant status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch restaurant status' },
      { status: 500 }
    );
  }
}
