# AfriBet Games & Entertainment

![AfriBet Games Banner](https://via.placeholder.com/1200x300/22c55e/ffffff?text=AfriBet+Games+%26+Entertainment)

> Africa's Premier Online Gaming Platform - Win Big, Play Smart, Get Paid Instantly

## 🎯 Overview

AfriBet Games and Entertainment is an innovative online/offline gaming platform that allows users to win big by simply picking numbers with favorable odds. Our platform features instant result displays, Virtual betting with 35-week cycles, Main games (Minor, Major, Mega), and daily Noon and Night games - all designed to provide full-time entertainment and rewards for our customers across Africa.

## ✨ Key Features

### 🎫 Professional Colorful Ticket System
- **Dual Ticket Types**: Separate betting slips and results tickets
- **Beautiful Gradient Design**: Colorful, attractive tickets with modern gradients
- **Premium Visual Experience**: Professional design with rounded corners and shadows
- **QR Code Verification**: Secure ticket authentication with gradient borders
- **Authentic Badge**: Gold gradient badge confirming ticket authenticity
- **Color-Coded Numbers**: Green gradients for matched numbers, gold for bonus
- **Instant Printing**: Print betting slip immediately after placing bet
- **Results Ticket**: Separate ticket showing winning numbers and payouts with vibrant colors
- **Short Code System**: 8-character codes for easy verification
- **Portable Design**: Optimized for mobile viewing and printing

### 🌍 Multi-Country Support
- 18+ African countries supported
- Local currency display (₦, GH₵, KSh, R, etc.)
- Country-specific game availability
- "Coming Soon" notifications for inactive countries

### 💬 Community Forum
- Share game codes and promotional offers
- Post lucky numbers and predictions
- Share winning stories and testimonies
- Get strategy tips from other players
- Filter posts by game type

### 🎨 Modern User Experience
- Dark mode support with theme toggle
- Mobile-first responsive design
- Real-time countdown timers
- Instant result notifications
- Smooth animations with Framer Motion

## 🎮 Game Types

### 1. Virtual Betting ⚡
- **Number Range:** 0-40
- **Odds:** 1.01-7.00 (randomized)
- **Selections:** Pick 5 numbers
- **Schedule:** 35 virtual weeks per cycle
- **Draw Time:** Every Sunday at 6:00 PM
- **Minimum Matches:** 3+ numbers to win
- **Special Feature:** Week tracking system with countdown timer

### 2. Main Game - Minor 🎯
- **Number Range:** 0-40
- **Odds:** 1.01-7.00 (randomized)
- **Selections:** Pick 5 numbers
- **Minimum Matches:** 3+ numbers to win
- Perfect for beginners with favorable odds!

### 3. Main Game - Major 💎
- **Number Range:** 0-60
- **Odds:** 1.01-13.00 (randomized)
- **Selections:** Pick 7 numbers
- **Minimum Matches:** 3+ numbers to win
- Bigger range, better payouts!

### 4. Main Game - Mega 💰
- **Number Range:** 0-90
- **Odds:** 1.01-17.00 (randomized)
- **Selections:** Pick 10 numbers
- **Minimum Matches:** 5+ numbers to win
- Maximum excitement with the highest potential winnings!

### 5. Noon Game ☀️
- **Number Range:** 0-25
- **Odds:** 1.01-12.00 (randomized)
- **Selections:** Pick 3 numbers + 1 Bonus number (auto-generated)
- **Draw Time:** Daily at 12:00 PM
- **Minimum Matches:** 2+ numbers + bonus
- Perfect for your lunch break!

### 6. Night Game 🌙
- **Number Range:** 0-25
- **Odds:** 1.01-12.00 (randomized)
- **Selections:** Pick 3 numbers + 1 Bonus number (auto-generated)
- **Draw Time:** Daily at 12:00 AM (midnight)
- **Minimum Matches:** 2+ numbers + bonus
- End your day with a chance to win!

## 📊 How It Works

### Step 1: Select Your Country 🌍
Choose your country from the selector in the header. All amounts will display in your local currency.

### Step 2: Choose a Game 🎮
Select from Virtual Betting, Minor, Major, Mega, Noon, or Night games based on your preference.

### Step 3: Pick Your Numbers 🎯
Select your lucky numbers from the available range. The system shows odds for each number.

### Step 4: Place Your Stake 💵
Enter your stake amount. The calculator shows your potential winnings.

### Step 5: Print Betting Slip 🎫
Immediately after placing your bet, print your official betting slip with QR code.

### Step 6: Wait for Results ⏰
Check results based on the game schedule. Virtual Betting draws every Sunday at 6 PM, Noon Game at 12 PM, Night Game at midnight.

### Step 7: Print Results Ticket 🏆
After the draw, print your results ticket showing matched numbers and winnings.

### Step 8: Collect Your Winnings! 💰
Present your winning ticket to claim your payout!

## 💻 Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - High-quality accessible components
- **Wouter** - Lightweight routing (~1KB)
- **TanStack Query v5** - Data fetching & caching
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation

### Backend
- **Node.js 20** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Full type safety
- **In-memory Storage** - Fast data access (development)
- **QRCode Library** - Ticket verification

### Development Tools
- **Vite** - Fast build tool and dev server
- **Drizzle ORM** - Type-safe database toolkit
- **TSX** - TypeScript execution
- **ESBuild** - Fast bundler

## 🚀 Installation & Setup

### Prerequisites
- Node.js 20 or higher
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/afribet/afribet-platform.git
cd afribet-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:5000`

The application will automatically reload when you make changes to the code.

### VS Code Setup (Recommended for Developers)

**Perfect for Windows, Mac, and Linux!**

1. **Open project in VS Code**
   ```bash
   code .
   ```

2. **Open terminal in VS Code** (`` Ctrl+` ``)

3. **First time setup**
   ```bash
   npm run setup
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

5. **Open browser**
   - Go to `http://localhost:5000`

**See `VSCODE-SETUP.md` for:**
- Complete VS Code integration guide
- Debugging configuration
- Recommended extensions
- Keyboard shortcuts
- Troubleshooting tips

### Windows Quick Start (.bat scripts)

For non-developers who prefer double-click scripts:

1. **First Time Setup**: Double-click `setup-windows.bat`
2. **Start App**: Double-click `start-windows.bat`
3. **Details**: See `WINDOWS-SETUP.md`

**Requirements:**
- Windows 10 or higher
- Node.js 18+ (download from [nodejs.org](https://nodejs.org/))

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment Variables

For development, no environment variables are required. The platform uses in-memory storage.

For production deployment:
```bash
# Optional: Configure database URL for persistent storage
DATABASE_URL=postgresql://...

# Optional: Configure session secret
SESSION_SECRET=your-secret-key
```

## 📦 Deployment

### Replit Deployment (Recommended)

Best option for this full-stack Express application with in-memory storage.

1. Click the "Deploy" button in Replit
2. Select "Autoscale" deployment target
3. Configure:
   - Build command: `npm run build`
   - Start command: `npm run start`
4. Click "Deploy"

### Alternative Platforms

**Render / Railway / Fly.io:**
- These platforms support Node.js/Express applications natively
- Simply connect your repository and set:
  - Build command: `npm run build`
  - Start command: `npm run start`

**Note about Vercel:**
- Vercel requires converting the Express backend to serverless functions
- For production, consider using Replit Deploy or platforms that support Node.js servers
- Alternatively, refactor the backend to use Vercel serverless functions

## 🏢 Company Information

### Vision
AfriBet Games and Entertainment aims to give full-time entertainment and rewards for gaming and betting to customers across Africa. We're raising the passion of our customers to get paid while having fun with transparent, fair gaming.

### Mission
- Establish 200+ branches/offices in the first twelve (12) months
- Introduce new gaming facilities for better entertainment experience
- Technically help startups around the community thrive
- Build a conducive environment for learning new technology
- Reduce crime by rewarding passion
- Create job opportunities, reducing poverty rates

### Founders
- **Frank Osakwe Aghedo** - Co-Founder
- **Ifeadi Andrew Norbert** - Co-Founder

### Contact Information
- **Office:** Pan-African Headquarters - Multiple locations across Africa
- **Email:** info@afribetgames.com
- **Website:** https://afribetgames.com

## 📈 Investment Opportunity

AfriBet Games is positioned to become the leading gaming platform across Africa.

### Key Metrics
- **200+ Branches** planned in first 12 months
- **1M+ Target Users** in year one
- **24/7 Operations** for continuous revenue
- **Multi-game Platform** with diverse revenue streams
- **18+ Countries** supported at launch

### Why Invest?
1. **Proven Business Model** - Multiple revenue streams from various game types
2. **Scalable Technology** - Online/offline platform with automated operations
3. **Social Impact** - Creating jobs, reducing poverty, supporting tech education
4. **Large Market** - Africa's growing gaming and entertainment sector
5. **Strong Leadership** - Experienced founding team with clear vision
6. **Technical Excellence** - Modern tech stack with professional features

For investment inquiries, please contact us at info@afribetgames.com

## 🌍 Supported Countries

AfriBet Games is available across Africa including:

| Country | Currency | Symbol | Status |
|---------|----------|--------|--------|
| Nigeria 🇳🇬 | NGN | ₦ | ✅ Active |
| Ghana 🇬🇭 | GHS | GH₵ | ✅ Active |
| Kenya 🇰🇪 | KES | KSh | ✅ Active |
| South Africa 🇿🇦 | ZAR | R | ✅ Active |
| Tanzania 🇹🇿 | TZS | TSh | 🔜 Coming Soon |
| Uganda 🇺🇬 | UGX | USh | 🔜 Coming Soon |
| Rwanda 🇷🇼 | RWF | FRw | 🔜 Coming Soon |
| Ethiopia 🇪🇹 | ETB | Br | 🔜 Coming Soon |
| And more... | | | |

## 🎨 Design Philosophy

Our platform combines the excitement of gaming with professional credibility:

### Colors
- **Primary Green (#22c55e)** - Represents growth, winning, and money
- **Clean Backgrounds** - Professional and easy to read
- **High Contrast Numbers** - Crystal clear game results
- **Dark Mode** - Comfortable viewing in any lighting

### Typography
- **Poppins** - Bold, confident headings
- **Inter** - Clean, readable body text
- **Courier New** - Professional ticket design

### User Experience
- Mobile-first responsive design
- Instant feedback on all interactions
- Clear odds and winning calculations
- Transparent results display
- Professional printed tickets

## 🛡️ Responsible Gaming

AfriBet Games is committed to responsible gaming:
- Must be 18+ to participate
- Clear odds and probability information
- Win/loss tracking for user awareness
- Support for responsible gaming practices
- Secure ticket verification system

## 📝 License

Copyright © 2025 AfriBet Games and Entertainment. All rights reserved.

## 🤝 Support

For support, email info@afribetgames.com or visit https://afribetgames.com/support

## 📚 Documentation

For detailed technical documentation, see [DOCS.md](./DOCS.md)

## 🚀 Deployment & Hosting

AfriBet Games is configured to work on **multiple hosting platforms**:

### Quick Deploy Options

1. **Vercel (Serverless)** - Recommended for production
   - 5-minute setup with auto-scaling
   - Requires external database (Neon/Vercel Postgres)
   - See [README-VERCEL.md](./README-VERCEL.md)

2. **Replit** - Currently running
   - Instant deployment with one click
   - Perfect for development and demos
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)

3. **Traditional VPS** (DigitalOcean, AWS, etc.)
   - Full server control
   - Works with or without database
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)

**Quick Start**: See [HOSTING-OPTIONS.md](./HOSTING-OPTIONS.md) for a complete comparison and deployment guide.

---

**AfriBet Games & Entertainment** - Win Big. Play Smart. Get Paid Instantly. 🎯
