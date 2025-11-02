# Deploying AfriBet Games to Vercel

## Quick Start

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect settings from `vercel.json`
   - Click "Deploy"

## Important: Database Setup

⚠️ **Critical**: The app currently uses in-memory storage which will NOT work on Vercel (serverless resets memory).

### Option 1: Use Neon (Recommended - Free Tier Available)

1. Create a free database at [neon.tech](https://neon.tech)
2. Copy your connection string
3. Add to Vercel environment variables:
   ```
   DATABASE_URL=your_neon_connection_string
   ```
4. Update `server/storage.ts` to use PostgreSQL instead of MemStorage

### Option 2: Use Vercel Postgres

1. In your Vercel project dashboard
2. Go to "Storage" tab
3. Create a new Postgres database
4. Connect it to your project
5. Update `server/storage.ts` to use PostgreSQL

### Option 3: Use Vercel KV (Simple Key-Value)

1. In your Vercel project dashboard
2. Go to "Storage" tab  
3. Create a new KV database
4. Update storage implementation to use KV

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```
NODE_ENV=production
DATABASE_URL=your_database_connection_string
```

## Vercel Configuration

The project includes:
- ✅ `vercel.json` - Routing and build configuration
- ✅ `api/index.ts` - Serverless API handler
- ✅ `.vercelignore` - Files to exclude from deployment

## Testing Locally with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally (simulates Vercel environment)
vercel dev

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Architecture on Vercel

```
Vercel Deployment
├── Frontend (Static) → dist/public/
│   └── Served from Vercel Edge Network
└── Backend (Serverless) → api/index.ts
    └── Runs as serverless function on each request
```

## Differences from Replit

| Feature | Replit | Vercel |
|---------|--------|--------|
| Server | Long-running Express | Serverless functions |
| Storage | In-memory works | Need external database |
| Environment | Single instance | Distributed edge |
| Scaling | Manual | Automatic |
| Port | 5000 | Automatic |

## Troubleshooting

### API Routes Return 404
- Check `vercel.json` routing configuration
- Ensure `api/index.ts` exists
- Check function logs in Vercel dashboard

### Data Not Persisting
- You're still using in-memory storage
- Set up a database (see above)
- Update storage implementation

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

## Performance Optimization

1. **Enable Edge Caching** (for static assets)
2. **Use Vercel Analytics** (monitor performance)
3. **Set up monitoring** (errors and response times)

## Cost Considerations

- **Free Tier**: 100GB bandwidth, serverless function invocations
- **Pro Tier**: Unlimited bandwidth, faster builds
- Monitor usage in Vercel dashboard

---

For full deployment documentation, see [DEPLOYMENT.md](./DEPLOYMENT.md)
