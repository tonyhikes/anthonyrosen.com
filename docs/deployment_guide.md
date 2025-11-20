# Deployment Guide: From Local to Live

This guide will walk you through getting your website live on Vercel using GitHub, and setting up your domains `anthonyrosen.com` and `tonyrosen.com`.

## 1. Concepts: Why GitHub & Vercel?

### Why GitHub?
**GitHub** is a platform for hosting code. It uses **Git**, which is a "version control system".
- **Backup**: Your code is safe in the cloud.
- **History**: You can see every change you've ever made and go back if something breaks.
- **Collaboration**: It's how developers work together.
- **Antigravity**: I (Antigravity) help you write the code on your computer. GitHub is where we store the "official" copy.

### Do you need GitHub with Vercel?
**Yes, it is highly recommended.**
While you *can* deploy directly from your computer, connecting Vercel to GitHub gives you **Continuous Deployment**.
- **Magic**: Every time we push a change to GitHub, Vercel sees it, builds your site, and updates the live website automatically. You don't have to "upload" anything manually ever again.

## 2. Preparation

Your project is an **Astro** website. This is a modern, fast web framework.

### Step 1: Initialize Git (If not already done)
I will help you do this in the terminal. We need to turn your folder into a Git repository.

### Step 2: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Name it `tony-rosen-portfolio` (or similar).
3. Make it **Public** or **Private** (your choice).
4. **Do not** initialize with README, .gitignore, or License (we already have these).
5. Click **Create repository**.
6. You will see a page with commands. Copy the commands under **"…or push an existing repository from the command line"**.

### Step 3: Push Code
I will help you run those commands to send your code to GitHub.

## 3. Deployment on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login (continue with GitHub is easiest).
2. Click **"Add New..."** -> **"Project"**.
3. You should see your new `tony-rosen-portfolio` repository in the list. Click **Import**.
4. Vercel will detect it's an **Astro** project. The default settings are usually correct.
5. Click **Deploy**.
6. Wait a minute, and your site will be live at a `something.vercel.app` URL!

## 4. Domain Setup (Spaceship.com)

Now we connect your real domains.

### Part A: Main Domain (anthonyrosen.com)
1. In your Vercel Project Dashboard, go to **Settings** -> **Domains**.
2. Enter `anthonyrosen.com` and click **Add**.
3. Choose the option recommended (usually adding `www.anthonyrosen.com` as well).
4. Vercel will give you **DNS Records** to add (usually an **A Record** and a **CNAME Record**).
   - **Type**: `A` | **Name**: `@` | **Value**: `76.76.21.21`
   - **Type**: `CNAME` | **Name**: `www` | **Value**: `cname.vercel-dns.com`
5. Go to **Spaceship.com** -> **Domain List** -> Manage `anthonyrosen.com` -> **Advanced DNS**.
6. Add the records Vercel gave you.
7. Delete any conflicting records (like default parking pages).

### Part B: Redirect Domain (tonyrosen.com)
1. In Vercel **Settings** -> **Domains**, enter `tonyrosen.com` and click **Add**.
2. Vercel might ask how you want to redirect. Choose **Redirect to anthonyrosen.com** (308 Permanent Redirect).
3. Vercel will give you DNS records for `tonyrosen.com` as well.
4. Go to **Spaceship.com** -> Manage `tonyrosen.com` -> **Advanced DNS**.
5. Add the records Vercel provides.

## Next Steps
I will now help you with **Step 1 (Git Init)** and **Step 3 (Pushing)**. You will need to do the browser parts.
