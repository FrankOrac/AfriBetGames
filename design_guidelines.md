# GrossPay Games & Entertainment - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based with Gaming Platform Focus

Drawing inspiration from industry leaders in gaming and betting platforms (DraftKings, Bet365, FanDuel) while incorporating the professionalism of fintech platforms (Stripe, Coinbase) for the investor-facing sections. This dual approach balances the excitement of gaming with the credibility needed for investor attraction.

**Key Design Principles:**
1. **Energy & Excitement:** Gaming sections should feel dynamic and engaging
2. **Trust & Credibility:** Investor sections prioritize professionalism and clarity
3. **Instant Clarity:** Game rules, odds, and results must be immediately understandable
4. **Data Visibility:** Numbers, odds, and winnings prominently displayed

---

## Typography System

**Primary Font:** Inter (via Google Fonts CDN)
- Clean, modern, excellent readability for numbers and data
- Used for UI elements, game interfaces, body text

**Display Font:** Poppins (via Google Fonts CDN)
- Bold, confident for headlines and CTAs
- Gaming section headers and marketing copy

**Hierarchy:**
- **Hero Headlines:** text-5xl md:text-6xl lg:text-7xl (Poppins Bold)
- **Section Headers:** text-3xl md:text-4xl lg:text-5xl (Poppins SemiBold)
- **Game Titles:** text-2xl md:text-3xl (Poppins Medium)
- **Body Text:** text-base md:text-lg (Inter Regular)
- **Number Displays:** text-4xl md:text-5xl lg:text-6xl (Inter Bold - for game numbers)
- **Odds & Stats:** text-xl md:text-2xl (Inter SemiBold)
- **Small Print/Labels:** text-sm (Inter Regular)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-4, p-6, p-8
- Section spacing: py-12 md:py-16 lg:py-20
- Element gaps: gap-4, gap-6, gap-8
- Game card spacing: p-6 md:p-8

**Container Strategy:**
- Full-width sections: w-full with max-w-7xl mx-auto px-4
- Game interfaces: max-w-6xl mx-auto
- Investor content: max-w-4xl mx-auto
- Results boards: max-w-5xl mx-auto

**Grid Systems:**
- Game selection: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Number selection boards: grid grid-cols-5 md:grid-cols-10 gap-2
- Feature highlights: grid grid-cols-1 md:grid-cols-3 gap-8
- Stats/metrics: grid grid-cols-2 md:grid-cols-4 gap-6

---

## Component Library

### Navigation
**Header:**
- Sticky top navigation with backdrop blur
- Logo left, navigation center, "Play Now" CTA right
- Mobile: Hamburger menu with slide-out drawer
- Nav items: Home, Games, How to Play, Results, About, Investors

### Landing Page Sections

**1. Hero Section (100vh with gradient overlay)**
- Large hero image: Energetic gaming atmosphere (people celebrating wins, or abstract gaming graphics)
- Centered content with company logo/name
- Headline: "Win Big. Play Smart. Get Paid Instantly."
- Subheadline explaining the platform
- Dual CTAs: "Start Playing" (primary) + "View Results" (secondary)
- Trust indicators below: "200+ Branches Planned | Daily Payouts | Instant Results"
- Buttons with backdrop blur: backdrop-blur-md bg-white/20

**2. Platform Overview Section**
- Multi-column grid showcasing all seven game types (Virtual, Number Aviator, Lucky Numbers, Super Virtual, Main, Mid-Week, Weekend)
- Each card with icon, game name, key feature, odds range display
- Prominent "Learn More" links

**3. How It Works Section**
- Step-by-step visual process (4 steps)
- Numbered cards showing: Select Numbers → Place Stake → Instant Results → Collect Winnings
- Include sample calculation showing odds multiplication

**4. Live Results Preview**
- Real-time results board simulation
- Scrolling ticker with recent winning numbers
- "View All Results" CTA

**5. Games Deep Dive Section**
- Tabbed interface or accordion for each game type
- Detailed rules, odds tables, example scenarios
- Visual number range displays (0-40 for Virtual, 0-89 for Main/Mid-Week/Weekend)

**6. Investor Attraction Section**
- Professional layout with business metrics
- Vision/Mission statement in prominent typography
- Expansion plan highlights (200 branches in 12 months)
- Founder information with professional headshots
- Key differentiators and market opportunity
- "View Full Proposal" or "Contact Us" CTA

**7. Company Information**
- Office location with map integration
- Contact details (email: grosspaymobile@gmail.com, website)
- Social proof elements

**8. Footer**
- Multi-column: Company info, Quick Links, Games, Legal, Contact
- Newsletter signup for gaming updates and bonuses
- Social media links
- Office address: No 52, Old Benin-Agbor Road, Benin City, Edo State, Nigeria

### Game Interface Components

**Number Selection Board:**
- Grid of clickable number buttons (0-40 or 0-89 depending on game)
- Selected state: highlighted with border and background treatment
- Disabled state for unavailable numbers
- Clear "Clear Selection" and "Confirm" buttons

**Odds Display:**
- Large, prominent odds multiplier shown
- Dynamic calculation as numbers are selected
- Format: "2.5x" or "Odds: 1-5" range display

**Stake Input:**
- Clean number input with increment/decrement buttons
- Preset stake amounts (quick select chips)
- Real-time potential winnings calculator
- "Potential Win: ₦X,XXX" display

**Results Board:**
- Winning numbers in large circles or squares
- Bonus number differentiated with distinct styling
- Result timestamp
- Animation when results appear
- Matched numbers highlighted for user reference

**User Dashboard Card:**
- Recent bets history in tabular format
- Active bets status
- Winnings summary
- Quick access to each game type

### UI Elements

**Buttons:**
- Primary: Large, bold, rounded-lg, px-8 py-4
- Secondary: Outlined style, same dimensions
- Icon buttons: Square with p-3, rounded-lg
- Game number buttons: Aspect-square, text-lg md:text-xl

**Cards:**
- Game cards: rounded-xl, p-6 md:p-8, with shadow-lg
- Result cards: rounded-lg, p-4
- Info cards: rounded-lg, p-6

**Forms:**
- Input fields: rounded-lg, px-4 py-3, border-2
- Labels: text-sm font-medium, mb-2
- Error states: red border with error message below

**Icons:**
- Use Heroicons for UI elements (via CDN)
- Gaming-specific icons: dice, trophy, coins, numbers, calendar
- 24px for inline icons, 48px+ for feature highlights

### Data Visualization

**Winning Calculation Display:**
- Visual formula showing: (Number odds × Number odds × ... × Stake) = Win Amount
- Clear mathematical representation
- Animated when calculating

**Game Statistics:**
- Win rate indicators
- Popular number selections
- Recent big wins showcase

---

## Images

**Hero Section:**
- Large, high-quality hero image spanning full viewport
- Theme: Excitement of winning - celebrating people, or abstract gaming graphics with numbers/patterns
- Treatment: Subtle gradient overlay to ensure text readability

**Game Section Headers:**
- Each game type (Virtual, Main, Mid-Week, Weekend) has a background image or pattern
- Abstract number patterns or gaming-themed graphics

**Investor Section:**
- Professional office/team photos
- Nigeria location imagery (if available)
- Infographic-style business model visualization

**About/Company:**
- Founder professional headshots
- Office location exterior/interior photos
- Community impact imagery

---

## Animations

Use sparingly for maximum impact:
- Number selection: subtle scale and border animation on click
- Results reveal: staggered fade-in for winning numbers
- Winning calculation: brief highlight pulse
- Hero CTA buttons: subtle lift on hover
- Card hover: gentle elevation increase (shadow transition)

---

## Accessibility

- High contrast for number displays and odds
- Clear focus states for keyboard navigation
- Large touch targets for number selection (min 44px)
- ARIA labels for game controls
- Screen reader announcements for results
- Form validation with clear error messages

---

## Responsive Behavior

**Mobile (< 768px):**
- Single column layouts
- Number grids: 5-6 columns max
- Stacked navigation in drawer
- Simplified stake input

**Tablet (768px - 1024px):**
- 2-column game selection
- Number grids: 8-10 columns
- Side-by-side stake input and potential winnings

**Desktop (> 1024px):**
- Full 3-column layouts
- Number grids: 10+ columns for optimal viewing
- Expanded navigation
- Side-by-side game interface (numbers left, bet slip right)

---

## Special Considerations

**Nigerian Market Localization:**
- Currency: Nigerian Naira (₦) prominently displayed
- Local payment methods highlighted
- Time displays in WAT (West Africa Time)
- Mobile-first approach (high mobile usage in Nigeria)

**Gambling Responsibility:**
- Age verification prompts
- Responsible gaming messages in footer
- Clear odds and probability information
- Win/loss tracking for user awareness