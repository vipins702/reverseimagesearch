# Deployment Configuration

## Current Issue: X-Robots-Tag: noindex

The `X-Robots-Tag: noindex` header is likely being applied because:

1. **Preview Deployment**: Your current URL appears to be a preview deployment
2. **Vercel Default Behavior**: Vercel adds `noindex` to preview deployments by default

## Solutions:

### Option 1: Use Production Domain
- Set up a custom domain in Vercel
- Production domains don't get the `noindex` tag

### Option 2: Force Production Deployment
```bash
# Deploy to production branch
git checkout -b production
git push origin production

# Or force production deployment
vercel --prod
```

### Option 3: Environment Variables
Add to Vercel dashboard:
```
VERCEL_ENV=production
NODE_ENV=production
```

### Option 4: Custom Domain Setup
1. Go to Vercel Dashboard
2. Project Settings → Domains
3. Add custom domain (e.g., reverseimagesearch.com)
4. Custom domains bypass preview restrictions

## Current URL Analysis:
`reverseimagesearch-8zk2qqheg-vipins702-gmailcoms-projects.vercel.app`

This appears to be an auto-generated preview URL. The hash `8zk2qqheg` suggests it's a deployment preview.

## Recommended Action:
1. Set up custom domain OR
2. Deploy to production branch OR  
3. Use `vercel --prod` command