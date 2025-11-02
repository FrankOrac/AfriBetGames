# AfriBet Games - Deployment Guide

This application supports multiple deployment options:

## 1. Vercel Deployment (Recommended for Production)

### Prerequisites
- A Vercel account (free tier available)
- Git repository connected to Vercel

### Steps to Deploy to Vercel

1. **Install Vercel CLI** (optional, for command-line deployment):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard** (easiest method):
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Vercel will auto-detect the configuration from `vercel.json`
   - Click "Deploy"

3. **Deploy via CLI**:
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

4. **For Production Deployment**:
   ```bash
   vercel --prod
   ```

### Important Notes for Vercel
- **Serverless Functions**: All API routes run as serverless functions
- **In-Memory Storage**: The current in-memory storage will reset between requests on Vercel. For production, you should:
  - Set up a database (PostgreSQL recommended)
  - Update the storage implementation to use the database
  - Or use Vercel KV for simple key-value storage
- **Environment Variables**: Set any required environment variables in Vercel dashboard
- **Build Output**: Frontend builds to `dist/public`, API functions in `api/` directory

---

## 2. Replit Deployment (Current Setup)

The application is already configured to run on Replit.

### Running on Replit
```bash
npm run dev
```

This starts the Express server on port 5000 with:
- Backend API at `/api/*`
- Frontend served via Vite in development mode

### Publishing on Replit
1. Click the "Deploy" button in Replit
2. The deployment configuration is already set in `.replit` and the deploy config
3. Production build uses:
   ```bash
   npm run build  # Builds frontend and backend
   npm run start  # Runs production server
   ```

---

## 3. Traditional Hosting (VPS, DigitalOcean, AWS EC2, etc.)

### Prerequisites
- Node.js 20+ installed on server
- Process manager (PM2 recommended)

### Setup Steps

1. **Install PM2** (process manager):
   ```bash
   npm install -g pm2
   ```

2. **Clone your repository**:
   ```bash
   git clone <your-repo-url>
   cd afribet-games
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Build the application**:
   ```bash
   npm run build
   ```

5. **Start with PM2**:
   ```bash
   pm2 start npm --name "afribet-games" -- start
   ```

6. **Set up PM2 to restart on reboot**:
   ```bash
   pm2 startup
   pm2 save
   ```

7. **Configure Nginx** (if using as reverse proxy):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Enable SSL with Certbot** (recommended):
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

### Environment Variables
Create a `.env` file (or set environment variables):
```bash
NODE_ENV=production
PORT=5000
```

### Monitoring
```bash
pm2 logs afribet-games  # View logs
pm2 status              # Check status
pm2 restart afribet-games  # Restart app
pm2 stop afribet-games     # Stop app
```

---

## Database Considerations

### Current Setup
- Uses **in-memory storage** (MemStorage)
- Data resets on server restart
- **Not suitable for production on Vercel** (serverless resets memory)

### For Production Deployment
You should migrate to a persistent database:

1. **PostgreSQL** (recommended):
   - Neon (serverless PostgreSQL, works great with Vercel)
   - Supabase
   - Railway
   - Your own PostgreSQL instance

2. **Update Storage Implementation**:
   - Replace `MemStorage` in `server/storage.ts` with database implementation
   - Use Drizzle ORM (already configured) with PostgreSQL
   - Run migrations: `npm run db:push`

---

## Build Scripts Overview

- `npm run dev` - Development mode (Express + Vite hot reload)
- `npm run build` - Production build (frontend + backend)
- `npm run start` - Start production server (port 5000)
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

---

## Architecture Overview

### Development (Replit/Local)
```
Port 5000
├── Express Server (Backend)
│   ├── API Routes (/api/*)
│   └── Vite Dev Server (Frontend with HMR)
```

### Production (Replit/VPS)
```
Port 5000
├── Express Server
│   ├── API Routes (/api/*)
│   └── Static Files (dist/public)
```

### Vercel (Serverless)
```
Vercel Edge Network
├── Static Files (Frontend)
├── Serverless Functions
│   └── /api/* → api/index.ts (wraps Express routes)
```

---

## Troubleshooting

### Vercel: API Routes Not Working
- Check `vercel.json` configuration
- Ensure `api/index.ts` is present
- Check Vercel function logs in dashboard

### Traditional Hosting: Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

### Replit: Application Not Starting
- Check workflow logs
- Ensure `tsx` is installed: `npm install`
- Restart the workflow

---

## Support

For issues or questions:
- Check the logs first
- Review the relevant deployment section above
- Contact support team

---

**Note**: This setup maintains the Express server for backward compatibility with Replit and traditional hosting, while also supporting Vercel's serverless architecture through the `/api` directory.
