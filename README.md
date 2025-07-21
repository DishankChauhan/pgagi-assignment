# Personalized Content Dashboard

A dynamic, interactive content dashboard built with Next.js, React, TypeScript, Redux Toolkit, and Tailwind CSS. This application aggregates content from multiple sources including news, music, and social media posts, providing users with a personalized and customizable experience.

## 🚀 Features

### Core Features
- **Personalized Content Feed**: Aggregated content from news, music, and social media
- **User Preferences**: Configurable categories, dark mode, and content filtering
- **Interactive Content Cards**: Rich content display with images, metadata, and actions
- **Infinite Scrolling**: Efficient content loading with pagination
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Advanced Features
- **Drag & Drop**: Reorder content cards using @dnd-kit
- **Dark Mode**: Toggle between light and dark themes with smooth transitions
- **Search Functionality**: Debounced search across all content types
- **Favorites System**: Save and manage favorite content items
- **Real-time Updates**: Dynamic content fetching and state management

### Technical Features
- **Redux Toolkit**: Centralized state management with persistence
- **TypeScript**: Full type safety and enhanced developer experience
- **Framer Motion**: Smooth animations and transitions
- **Testing Suite**: Unit tests with Jest and E2E tests with Cypress
- **Performance Optimized**: Lazy loading, memoization, and efficient rendering

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit, Redux Persist
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **Icons**: Heroicons
- **Testing**: Jest, React Testing Library, Cypress
- **API Integration**: NewsAPI, Spotify API

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- API Keys for:
  - [NewsAPI](https://newsapi.org/) - Free tier available
  - [Spotify for Developers](https://developer.spotify.com/) - Free tier available

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/DishankChauhan/pgagi-assignment
cd pgagi-assignment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# News API - Get your free API key from https://newsapi.org/
NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key_here

# Spotify API - From your Spotify Developer Dashboard
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🧪 Testing

### Unit Tests

Run unit tests with Jest and React Testing Library:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

Run end-to-end tests with Cypress:

```bash
# Install Cypress (if not already installed)
npx cypress install

# Run Cypress in interactive mode
npx cypress open

# Run Cypress in headless mode
npx cypress run
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── sections/          # Page sections
│   ├── __tests__/         # Component tests
│   ├── ContentCard.tsx    # Content card component
│   ├── DashboardLayout.tsx # Main layout
│   ├── Header.tsx         # Header component
│   ├── LoadingSpinner.tsx # Loading component
│   ├── providers.tsx      # Redux providers
│   ├── SettingsPanel.tsx  # Settings panel
│   └── Sidebar.tsx        # Navigation sidebar
└── lib/                   # Utilities and configuration
    ├── features/          # Redux slices
    ├── hooks.ts           # Custom hooks
    └── store.ts           # Redux store
```

## 🎯 Usage Guide

### Navigation
- Use the sidebar to navigate between different sections
- Toggle the sidebar with the hamburger menu
- Switch between Feed, Trending, Favorites, and Search

### Content Interaction
- **Favorite**: Click the heart icon to save content
- **Read/View**: Click "Read More" or "View Details" to open content
- **Share**: Use the share icon for social sharing
- **Drag & Drop**: Reorder content cards by dragging

### Personalization
- **Settings**: Click the gear icon to open preferences
- **Categories**: Select your favorite content categories
- **Dark Mode**: Toggle between light and dark themes
- **Language**: Choose your preferred language

### Search
- Use the header search bar for quick searches
- Visit the Search section for advanced search options
- Search across news, music, and social content

## 🔧 Configuration

### API Configuration
The application uses environment variables for API configuration. Make sure to set up your API keys in `.env.local`.

### Redux State
The application state is persisted using Redux Persist. User preferences and UI state are saved to localStorage.

### Responsive Design
The application is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

The easiest way to deploy is using Vercel:

```bash
npm install -g vercel
vercel
```

### Environment Variables in Production

Make sure to set the following environment variables in your production environment:
- `NEXT_PUBLIC_NEWS_API_KEY`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## 🧪 Testing Strategy

### Unit Tests
- Component rendering and props
- User interactions and event handlers
- Redux state changes and actions
- Utility functions and hooks

### Integration Tests
- API integration and error handling
- Component interaction flows
- State management across components

### E2E Tests
- Complete user workflows
- Navigation and routing
- Search functionality
- Settings and preferences
- Responsive behavior

## 🔮 Future Enhancements

- **Authentication**: User login/signup with NextAuth.js
- **Real-time Updates**: WebSocket integration for live content
- **PWA Features**: Offline support and push notifications
- **Advanced Filtering**: More sophisticated content filtering
- **Social Features**: User profiles and content sharing
- **Analytics**: User behavior tracking and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is created for educational/assignment purposes.

## 🙏 Acknowledgments

- [NewsAPI](https://newsapi.org/) for news content
- [Spotify for Developers](https://developer.spotify.com/) for music data
- [Heroicons](https://heroicons.com/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations

---

**Note**: This is a demo application created for a frontend development assignment. API keys and external services are used for demonstration purposes.
