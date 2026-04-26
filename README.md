# 🌍 Hidden Gems - Travel Discovery Platform

A modern, community-driven web application for discovering and sharing lesser-known travel destinations around the world.

![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.9-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🗺️ **Explore Hidden Destinations** - Discover curated collection of lesser-known travel spots
- ➕ **Add New Destinations** - Share your favorite hidden gems with the community
- 📸 **Image Gallery** - Beautiful image uploads for each destination
- 🎨 **Dark/Light Mode** - Seamless theme switching with next-themes
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- ⚡ **Fast Performance** - Built with Next.js 16 and Turbopack
- 🔐 **Type-Safe** - Full TypeScript support for reliability
- 🎯 **Rich UI Components** - 40+ pre-built Radix UI components
- 💾 **Data Persistence** - LocalStorage for instant data saving
- 📊 **Analytics** - Vercel Analytics integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hidden-gems.git
cd hidden-gems
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open in browser**
```
http://localhost:3000
```

## 📦 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🏗️ Project Structure

```
hidden-gems/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   ├── explore/             # Browse destinations
│   ├── add-destination/     # Add new destination
│   ├── destination/[id]/    # Destination details
│   └── login/               # Login page
├── components/              # Reusable components
│   ├── header.tsx           # Navigation header
│   ├── footer.tsx           # Footer component
│   ├── theme-provider.tsx   # Theme configuration
│   └── ui/                  # Radix UI components (40+)
├── lib/                     # Utilities and helpers
│   ├── destinations.ts      # Destination data management
│   └── utils.ts             # Utility functions
├── hooks/                   # Custom React hooks
│   ├── use-mobile.ts        # Mobile detection
│   └── use-toast.ts         # Toast notifications
├── public/                  # Static assets
├── styles/                  # Global styles
├── next.config.mjs          # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS config
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies

```

## 🎨 Featured Destinations

The app comes pre-loaded with 6 beautiful destinations:

1. **Sapa Rice Terraces** - Vietnam 🌾
2. **Chefchaouen Blue City** - Morocco 💙
3. **Plitvice Lakes** - Croatia 💧
4. **Meteora Monasteries** - Greece ⛪
5. **Faroe Islands** - Denmark 🏔️
6. **Cappadocia** - Turkey 🎈

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.0.10** - React framework with Turbopack
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4.1.9** - Utility-first CSS
- **Radix UI** - Headless UI components
- **Lucide React** - Beautiful icons

### Form & Validation
- **React Hook Form** - Efficient form management
- **Zod** - TypeScript-first schema validation

### Additional Libraries
- **next-themes** - Dark/light mode
- **Embla Carousel** - Image carousels
- **Recharts** - Data visualization
- **Sonner** - Toast notifications
- **Vercel Analytics** - Usage tracking
- **date-fns** - Date utilities

## 🌐 Pages

### Home (`/`)
- Landing page with hero section
- Feature highlights
- Call-to-action buttons

### Explore (`/explore`)
- Browse all destinations
- Grid view of destination cards
- Click to view details

### Add Destination (`/add-destination`)
- Form to submit new destinations
- Image upload with preview
- Category selection

### Destination Details (`/destination/[id]`)
- Detailed destination information
- Full image view
- Location and category info

### Login (`/login`)
- Authentication page (ready for implementation)

## 💾 Data Management

The application uses **LocalStorage** for data persistence:

```typescript
// Get all destinations
getDestinations(): Destination[]

// Add new destination
addDestination(destination): Destination

// Get single destination
getDestinationById(id): Destination | undefined
```

Destinations persist across page reloads and browser sessions.

## 🧪 Testing

Testing setup is included in the project. Run tests with:

```bash
npm test
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

The deployment link will appear in your GitHub repository!

### Other Deployment Options

- **Netlify** - Import from GitHub, auto-deploy on push
- **GitHub Pages** - Export as static site
- **Self-hosted** - Run `npm run build && npm start`

## 🔧 Environment Variables

Create a `.env.local` file (if needed):

```
NEXT_PUBLIC_ANALYTICS_ID=your_vercel_analytics_id
```

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
npm run lint
npm run build
```

## 📊 Security

- No sensitive data in client code
- TypeScript for type safety
- Input validation with Zod
- Image optimization with Next.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Future Enhancements

- [ ] User authentication & profiles
- [ ] Backend database (PostgreSQL/MongoDB)
- [ ] Real-time comments & ratings
- [ ] Social sharing features
- [ ] Advanced filtering & search
- [ ] User-generated content moderation
- [ ] Mobile app (React Native)
- [ ] API documentation
- [ ] Performance optimizations

## 📞 Contact & Support

- **GitHub Issues** - Report bugs or request features
- **Discussions** - Ask questions and share ideas
- **Email** - akshay@example.com

## 🙏 Acknowledgments

- Built with [v0.app](https://v0.app) - AI code generator
- Icons by [Lucide](https://lucide.dev)
- UI Components by [Radix UI](https://www.radix-ui.com)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Hosted on [Vercel](https://vercel.com)

---

**Happy Exploring! 🌍✈️**
