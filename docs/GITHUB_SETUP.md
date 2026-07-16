# Getting this onto GitHub (first-time setup)

You've never used GitHub — here's the exact path from zero to a live repo
with this code in it.

## 1. Create your account
Go to github.com → Sign up. Use a professional username (this will be part
of your portfolio link, e.g. `github.com/yourusername`), not a nickname.

## 2. Create the repository
- Click the **+** in the top right → **New repository**
- Name it `rebuild-tracker`
- Set it to **Public** (so employers can see it)
- Do NOT initialize with a README (you already have one)
- Click **Create repository**

GitHub will show you a page with setup commands — keep that page open.

## 3. Install Git on your computer
If you don't already have it: go to git-scm.com, download, install with
default options.

## 4. Push this project to GitHub
Open a terminal in this project folder and run, one line at a time:

```bash
git init
git add .
git commit -m "Initial commit: Rebuild Log v1"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/rebuild-tracker.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username. It will prompt you
to log in the first time — follow the browser prompt it gives you.

## 5. Verify
Refresh your GitHub repo page. You should see all the files, and your
README should render automatically on the repo's homepage — that README is
the first thing anyone (including an interviewer) will see.

## 6. Pin it to your profile
Go to your GitHub profile page → **Customize your pins** → select
`rebuild-tracker`. This makes it one of the first things visible when
someone views your profile.

## 7. (Later) Deploy it live
Once you're ready to host it publicly:
- GitHub Settings → Pages → deploy from the `main` branch
- Or use a free host like Vercel/Netlify, connected directly to this repo

## What to say if this comes up in an interview

You don't need to memorize a script, but the shape of the answer is:

> "I stepped away from my career for about two years to be a full-time
> caregiver for my father until he passed. During and after that time, I
> was rebuilding several parts of my life at once — income, credit, physical
> health — and I didn't have a good way to track whether daily effort was
> actually converting into progress. So I designed and built this. It's a
> small system, but I made real architecture decisions in it — how the data
> is modeled, why I chose an append-only structure instead of just storing
> current values, how I kept the storage layer swappable so I could start
> simple and scale it later. It's on my GitHub if you want to look at the
> README, I wrote it the way I'd document a real design."

That's a complete, honest answer that turns the gap into a demonstration of
exactly the skill you're interviewing for.
