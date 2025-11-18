# ⚡ Quick Vercel Deployment

## 🚀 Fastest Way to Deploy

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** - Connect your GitHub account and select this repo
3. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `.` (root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install && cd ../backend && npm install`

4. **Add Environment Variables** (Click "Environment Variables"):
   
   **Required:**
   - `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/calorie-tracker?retryWrites=true&w=majority`
   - `JWT_SECRET` = `your-secret-key-here` (generate a random string)
   - `REACT_APP_API_URL` = `/api` (for same-domain deployment)
   - `NODE_ENV` = `production`

5. Click **Deploy** 🎉

### Step 3: Wait for Deployment
- Vercel will build and deploy your app
- Usually takes 2-5 minutes
- You'll get a URL like: `https://your-project.vercel.app`

---

## 📝 Environment Variables Quick Reference

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `MONGODB_URI` | MongoDB Atlas connection string | MongoDB Atlas Dashboard |
| `JWT_SECRET` | Random secure string | Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `REACT_APP_API_URL` | `/api` | Use `/api` if backend is on same domain |
| `NODE_ENV` | `production` | Set to production |

---

## ✅ That's It!

Your app should be live! Visit your Vercel URL to see it.

**Note**: Make sure MongoDB Atlas is set up and your connection string is correct.

---

## 🔧 Troubleshooting

**Build fails?**
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Verify build commands are correct

**API not working?**
- Check environment variables are set
- Verify MongoDB connection string
- Check Vercel function logs

**Frontend can't connect to API?**
- Ensure `REACT_APP_API_URL` is set to `/api`
- Check browser console for errors

