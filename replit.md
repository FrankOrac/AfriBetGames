# GrossPay Games & Entertainment

## Overview

GrossPay is Nigeria's premier online gaming platform that allows users to win by picking numbers with favorable odds. The platform features seven distinct game types: Virtual Betting (instant results), Number Aviator (fast-paced multipliers), Lucky Numbers (quick pick), Super Virtual (enhanced virtual), Main/Daily games, Mid-Week games with bonus numbers, and Weekend games with bonus numbers. The application serves both players seeking entertainment and potential investors interested in the gaming platform's growth across Africa.

## Branding

**Color Scheme**
- Primary Brand Color: Darker rich green (HSL: 120, 80%, 30-35%)
- Logo: GrossPay text-based wordmark (no image)
- Design Philosophy: Bold, modern, high-energy gaming aesthetic with professional edge
- Authentication: Demo app with open access - no login required

**House Edge & Profitability System**
The platform implements a "happy end algorithm" to ensure sustainable profitability:
- House Edge: 15% reduction on all payouts (configurable)
- Daily Payout Limit: Maximum 75% of daily stakes can be paid out to winners
- Single Win Cap: Maximum 1000x multiplier on individual bets
- Real-time tracking of daily stakes, payouts, and net profit
- Automatic payout limits prevent system losses exceeding daily gains

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system with custom theming
- Tailwind CSS for utility-first styling with custom design tokens
- Component structure follows atomic design principles with shared UI components in `client/src/components/ui/`

**Design System**
- Typography: Inter (UI/body) and Poppins (display/headings) from Google Fonts
- Color system: CSS custom properties for theme variables supporting light/dark modes
- Spacing: Tailwind's standardized spacing scale
- Custom border-radius values for consistent rounding

**State Management**
- React Query for server state (games, bets, results, winnings)
- Local component state with React hooks for UI interactions
- Form state managed via react-hook-form with Zod validation

**Key Pages**
- Home: Marketing landing page with game overview and investor section
- PlayGame: Interactive number selection and bet placement interface with 10-second countdown timer for virtual games
- Results: Display of historical game results with generation capability
- Dashboard: User bet tracking and winnings overview
- Forum: Community section where users share game codes, lucky numbers, and suggestions with comments

**Virtual Games Auto-Draw Feature**
- All virtual game types (Virtual Betting, Number Aviator, Lucky Numbers, Super Virtual) feature automatic result generation
- After placing a bet on a virtual game, a 10-second countdown timer begins
- Results are automatically generated and displayed when the countdown completes
- Live countdown display with progress bar shows time remaining
- Users can immediately see if they won without manual result checking
- "Play Again" button resets the interface for quick successive plays

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for the REST API
- Custom middleware for request logging and JSON parsing
- Session management via connect-pg-simple

**API Structure**
- RESTful endpoints under `/api` prefix
- Resource-based routes: `/api/games`, `/api/bets`, `/api/results`, `/api/winnings`, `/api/forum/posts`, `/api/forum/comments`
- Game-specific endpoints for retrieving by type and generating results
- Statistics endpoints: `/api/stats/daily`, `/api/stats/all`
- Configuration endpoints: `/api/config` (GET/PUT for house edge settings)
- Forum endpoints: `/api/forum/posts` (GET with optional gameType filter, POST), `/api/forum/posts/:postId/comments` (GET, POST)

**Data Layer**
- Drizzle ORM for type-safe database queries
- Schema-first design with TypeScript types derived from database schema
- Zod schemas for runtime validation on insertions

**In-Memory Storage (Current Implementation)**
- MemStorage class implementing IStorage interface
- Maps for storing users, games, bets, results, winnings, forum posts, and forum comments
- UUID-based primary keys using crypto.randomUUID()
- Designed for easy migration to PostgreSQL using Drizzle

**Game Logic**
- Four game types with distinct configurations (number ranges, odds, selection rules)
- Winning calculation based on matches and odds multiplication with house edge
- Result generation with random number selection
- Automatic winning determination when results are checked
- Profitability engine ensures house always maintains positive edge
- Daily payout tracking and limits prevent excessive losses
- Configurable house edge percentage and payout ratios

### Data Schema

**Core Entities**
- Users: Authentication and user management
- Games: Game type definitions with rules and configuration
- Bets: User selections with stake amounts and potential winnings
- Results: Generated winning numbers for each game
- Winnings: Calculated payouts when bets match results
- Forum Posts: Community-shared game codes, numbers, and suggestions with filtering by game type
- Forum Comments: User discussions and feedback on forum posts

**Game Types Enumeration**
- VIRTUAL: 0-40 range, 5 selections, instant results
- AVIATOR: 1-36 range, 3 selections, fast-paced multipliers
- LUCKY_NUMBERS: 1-50 range, 4 selections, quick pick with higher odds
- SUPER_VIRTUAL: 0-60 range, 6 selections, enhanced virtual with bigger payouts
- MAIN: 0-89 range, 5 selections, daily draws
- MIDWEEK: 0-89 range, 4+bonus selections, Wednesday draws
- WEEKEND: 0-89 range, 4+bonus selections, Saturday draws

**Data Relationships**
- Bets reference Games via gameId
- Results reference Games via gameId
- Winnings reference both Bets and Results via foreign keys

## External Dependencies

**Database**
- PostgreSQL (configured but currently using in-memory storage)
- Neon serverless PostgreSQL driver (@neondatabase/serverless)
- Connection string expected via DATABASE_URL environment variable

**UI Framework & Components**
- Radix UI: Comprehensive accessible component primitives
- Lucide React: Icon library for consistent iconography
- Embla Carousel: Touch-friendly carousel implementation
- cmdk: Command menu component
- Vaul: Drawer component for mobile interfaces

**Forms & Validation**
- react-hook-form: Performant form state management
- @hookform/resolvers: Integration with Zod validation
- Zod: Schema validation for both client and server
- drizzle-zod: Automatic Zod schema generation from Drizzle tables

**Development Tools**
- tsx: TypeScript execution for development
- esbuild: Production bundling for server code
- drizzle-kit: Database migration and schema management
- Replit-specific plugins for development environment integration

**Styling**
- Tailwind CSS with custom configuration
- PostCSS for CSS processing
- class-variance-authority: Type-safe variant styling
- tailwind-merge & clsx: Utility for merging Tailwind classes

**Date Handling**
- date-fns: Modern date utility library for formatting and manipulation

**Type Safety**
- TypeScript throughout the stack
- Shared types between client and server via `/shared` directory
- Path aliases configured in tsconfig.json for clean imports