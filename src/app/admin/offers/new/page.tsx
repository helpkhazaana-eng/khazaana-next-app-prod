import { getAllRestaurants } from '@/lib/restaurant-manager';
import NewOfferForm from './NewOfferForm';

export const metadata = {
  title: 'Create Offer | Khazaana Admin',
};

export default async function NewOfferPage() {
  const restaurants = await getAllRestaurants(false); // Only active restaurants

  return <NewOfferForm restaurants={restaurants} />;
}
