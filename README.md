# Inventorry

A home inventory management PWA for tracking household stock (tea, oil, rice, etc.) with low-stock indicators. Works offline in the browser, primarily designed for mobile use.

## Features

- **Products Management** - Add, edit, delete products with categories and units
- **Categories** - Organize products with drag-and-drop reordering and custom icons
- **Activity Logs** - Track all changes including quantity additions/removals
- **Low Stock Alerts** - Visual indicators when products are running low
- **Offline Support** - PWA with local storage, works without internet
- **Dark Mode** - Automatic theme based on system preference
- **Multi-language** - English and Hungarian localization

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- @dnd-kit (drag and drop)
- FontAwesome (icons)
- localStorage (persistence)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── categories/     # Category management
│   ├── layout/        # Header, Drawer, Modals
│   ├── logs/          # Activity log page
│   ├── products/      # Product list and modal
│   ├── settings/      # App settings and about
│   └── units/         # Unit management
├── data/
│   └── defaults.ts    # Default categories and units
├── hooks/
│   └── useI18n.tsx    # Internationalization hook
├── i18n/
│   ├── en.json        # English translations
│   └── hu.json        # Hungarian translations
├── lib/
│   └── version.ts     # App version
├── store/
│   └── useStore.ts    # Zustand store
├── types/
│   └── index.ts       # TypeScript interfaces
├── App.tsx
└── index.css          # Global styles and CSS variables
```

## License

MIT
