# 🍽️ Khazaana - Food Delivery Platform

> Bringing the best flavors of Aurangabad, West Bengal to your doorstep

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/khazaana-next-app)

## 🌟 Features

- **Restaurant Discovery** - Browse local restaurants and their menus
- **Real-time Orders** - Track your order status in real-time
- **Push Notifications** - Get updates on your orders via Firebase Cloud Messaging
- **Admin Dashboard** - Manage restaurants, orders, and offers
- **PWA Support** - Install as a native app on mobile devices
- **SEO Optimized** - Dynamic sitemap, robots.txt, and meta tags

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: Clerk
- **Database**: Google Sheets (via Apps Script)
- **Notifications**: Firebase Cloud Messaging
- **Monitoring**: Sentry, LogRocket, Umami
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/khazaana-next-app.git
cd khazaana-next-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
├── public/              # Static assets
├── scripts/             # Utility scripts (Google Apps Script, etc.)
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   ├── data/           # Static data and configurations
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and services
│   └── types/          # TypeScript type definitions
├── docs/               # Documentation
└── vercel.json         # Vercel deployment configuration
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables. Key services:

| Service | Purpose |
|---------|---------|
| Clerk | Admin authentication |
| Firebase | Push notifications |
| Google Sheets | Data storage |
| Sentry | Error tracking |
| LogRocket | Session replay |

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables in Vercel

Add all variables from `.env.example` to your Vercel project settings.

## 📄 License

This project is proprietary software owned by Khazaana.

## 👨‍💻 Developer

Built with ❤️ by [Siddharth Harsh Raj](https://linkedin.com/in/siddharthharshraj)

## 📞 Contact

- **Website**: [khazaana.co.in](https://khazaana.co.in)
- **Email**: helpkhazaana@gmail.com
- **Phone**: +91 86959 02696
