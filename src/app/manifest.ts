import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Khazaana',
    short_name: 'Khazaana',
    description: 'Order food from your favorite restaurants in Aurangabad, West Bengal',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0F14',
    theme_color: '#FF6A00',
    icons: [
      {
        src: '/images/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
