# Dice & Tale

The front door for Dice & Tale, a tabletop roleplaying community in Berlin.

Static Astro site, no client-side JavaScript. Seat booking stays on TTRPG.Events;
this site is what people see before they get there.

---

## Run it

```bash
cd diceandtale
npm install
npm run dev          # http://localhost:4321
npm run build        # -> dist/
npm run preview
```

Push a branch, review the Netlify deploy preview, merge to `main`.
`netlify.toml` already sets the build command and publish directory.

---

## Photographs

Photographs are the site. Every page is built to survive without them and to get
markedly better with them, and they are the one thing that cannot be generated.

```bash
cp ~/whatever/DSC*.jpg photos-raw/     # originals, full size, any name
npm run photos                          # derivatives + a stub per new photo
```

`npm run photos` writes AVIF, WebP and JPEG at 400/800/1600 into
`public/images/photos/`, and creates `src/content/photos/<slug>.md` for anything
new. Re-running is safe — it skips work already done.

Then open each new stub and fill it in:

```yaml
---
slug: "ten-around-one-table"
alt: "Ten people around one long table, name badges on, bottles between the dice."
caption: ""      # your voice. optional, but this is where the site sounds human
venue: ""        # only if you are sure
when: ""         # only if you are sure
orientation: "landscape"
hero: false      # true = eligible to lead a page
order: 50
---
```

**Alt text is not optional.** It is what a blind visitor is read, and
`npm run photos` will keep listing any photo still saying TODO. Describe what is
visible, not what it means.

**`caption`, `venue` and `when` ship empty on purpose.** Only somebody who was in
the room should fill them. A caption you cannot stand behind is worse than none,
and the layouts are built to look correct while they are blank.

### Changing the big photo on the home page

It lives in the content, not in the code. The home page uses whichever photo has
`hero: true` and the **lowest `order`** number.

To swap it, edit two files in `src/content/photos/`:

```yaml
# the one you want at the top
hero: true
order: 5          # lower than every other hero:true photo

# the one currently there
hero: false
```

Then `npm run build`. Nothing else to touch. If no photo is marked `hero: true`
the build stops with a message telling you so, rather than shipping a blank page.

The three photos in the band lower down and the portrait beside the "why this
exists" text are named explicitly near the top of `src/pages/index.astro`
(`bandPhotos` and `storyPhoto`) — those are sequence decisions, so they are set
per-page rather than by a flag.

### Attaching photos to a game day

```yaml
photos:
  - "circle-of-ten"      # first one becomes the page's hero
  - "two-tables-at-once"
```

---

## Adding a game day

One markdown file per game day in `src/content/gamedays/`, named `YYYY-MM-DD.md`.
Copy the newest and edit. The home page picks the newest entry whose `status` is
not `past`; everything else falls into the archive.

```yaml
---
title: "October Game Day"
date: 2026-10-04
startTime: "11:00"
endTime: "22:00"
venue: "Another Country Bookshop"
address: "Riemannstraße 7, 10961 Berlin"
entry: "Donation-based. Register, pick your table, roll."
capacity: 60
spotsLeft: 60
status: "open"                # open | upcoming | past
access:
  stepFree: "unconfirmed"     # yes | no | unconfirmed
  quietSpace: "unconfirmed"
  notes: ""
bookUrl: "https://ttrpg.events/diceandtale/<event-slug>"
scheduleUrl: "https://ttrpg.events/diceandtale/<event-slug>/schedule"
photos: []
sessions:
  - table: 1
    title: "..."
    system: "..."
    level: "Any level"
    gm: "..."
    start: "11:00"
    end: "15:00"
    seats: 4
    seatsLeft: 2              # or: full: true / waitlist: true
    tags: ["Beginner friendly"]
    contentWarnings: []
    adultsOnly: false
    blurb: "..."
---

Two or three sentences about this specific day, in your own words.
```

**After the day happens:** set `status: "past"`, drop `spotsLeft` and
`seatsLeft`, add the photos. It moves itself into the archive.

**Copy the blurbs from TTRPG.Events verbatim, typos included.** The GMs' own
wording is the best writing on the site and sanding it down is how a page starts
sounding machine-made.

### Content warnings

`contentWarnings` is deliberately separate from `tags` and rendered differently.
Tags are features ("Beginner friendly"). Warnings are what the table cannot
avoid.

Keep to **about three**, naming the core of the story rather than every
possibility — an exhaustive list reads as a hazard sheet and drives people away
instead of informing them. Anything narrower than that belongs in the lines and
veils conversation at the start of the table.

The ones currently in the repo were derived from what each GM already wrote in
their own blurb. **Have the GMs confirm their own**, and add the question to the
session proposal form so next month's arrive with the pitch.

### Access

`access` fields start at `unconfirmed`, and the page says so in plain words
rather than staying silent. Confirm them per venue and change them — a wrong
"step-free" strands somebody at a door.

Another Country Bookshop is described in the copy as a basement. Somebody needs
to go and look at the actual route in and write down what is true.

---

## Adding a game master

One file per person in `src/content/gms/`, photos in `public/images/gms/`:

```yaml
---
name: "Stephanie Platz"
photo: "/images/gms/stephanie-platz.jpg"
order: 10
runs: ["Fate Core", "Mothership", "Cairn 2e"]
---

One sentence in their own words.
```

Without a photo they render as initials, which looks deliberate rather than
broken. The "N tables" count is computed from the game day files — never typed.

---

## Deploying

Netlify project `diceandtale`, deploying from `github.com/erikroa/diceandtale`.
`netlify.toml` already sets the build command (`npm run build`) and the publish
directory (`dist`), so there is nothing to configure in the dashboard.

**First time — push the branch and look at the preview before touching `main`:**

This repository already lives at `C:\Users\erikr\DA_Projects\diceandtale` with the
rebuild committed on a branch called `astro-rebuild`. From that folder:

```bash
git push -u origin astro-rebuild
```

Netlify builds that branch and posts a deploy preview URL on the commit. Open it,
check it, then merge:

```bash
git checkout main
git merge astro-rebuild
git push
```

**Every time after that:**

```bash
cd C:\Users\erikr\DA_Projects\diceandtale
git add .
git commit -m "October game day"
git push
```

Netlify rebuilds on push to `main`. About a minute.

**Custom domain:** `diceandtale.com` is registered at GoDaddy and `site` in
`astro.config.mjs` already points at it. Add it in Netlify → Domain management →
Add a domain, choose **Set up Netlify DNS**, then paste the four nameservers it
gives you into GoDaddy → the domain → Change Nameservers → *I'll use my own*.
The HTTPS certificate is issued automatically once DNS resolves.

**Netlify Forms:** the newsletter form on `/join` is detected at deploy time from
the built HTML. It does nothing locally — submissions only work on the deployed
site and arrive in Netlify → Forms.

---

## Before this goes live

- [x] `src/pages/code-of-conduct.astro` — reporting address is `diceandtale@gmail.com`.
- [x] `astro.config.mjs` — `site` is `https://diceandtale.com`.
- [ ] Confirm the access facts for Another Country Bookshop.
- [ ] Netlify production visibility is **Private** (it was serving a stale March
      page). Flip it to Public in Project configuration → Visitor access.

---

## Design

Palette and type are sampled from the logo and documented in
`src/styles/global.css`. Two colours and a paper: violet `#280151`, gold
`#EDCF64`→`#A28B36`. Cinzel for display, EB Garamond for reading, JetBrains Mono
for times and seat counts.

No emoji, no gradients as decoration, no rounded cards, no centred text past the
masthead. Structure carries information: hairline rules instead of card borders,
numbered rails only where the sequence is real.

---

## Cities

The site is built for more than one city, but it only *shows* more than one when
there genuinely is more than one.

One file per city in `src/content/cities/`. The `status` field is the switch:

| status | What happens |
|---|---|
| `live` | Gets a full city page. Appears in the header switcher. |
| `planned` | Gets an honest "not running here yet" recruitment page. **Not** in the switcher. |
| `paused` | Archive stays readable, no next game day. |

`order` picks the **primary** city — the one rendered at `/`. Berlin is `order: 1`,
so `/` is Berlin's page and keeps the strongest content on the strongest URL.
`/berlin` also exists and carries a canonical pointing back at `/`, so the two
never compete in search.

**The header switcher appears on its own** once a second city is `live`. Until
then the header shows a plain city label linking to `/cities`. There is no menu
with one item in it pretending to be a network.

### Opening a city

1. Set `status: "live"` in `src/content/cities/warsaw.md`, name the team.
2. Add a game day file with `city: "warsaw"`.
3. Add game masters with `city: "warsaw"`, photos with `city: "warsaw"`.

That is the whole change. A live city with no photographs yet still gets a proper
page — the hero falls back to type on the brand violet rather than breaking.

Every existing game master and photo is tagged `city: "berlin"`, so nothing needs
migrating.
