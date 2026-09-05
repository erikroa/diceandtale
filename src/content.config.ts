import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* A photograph. `alt` describes what is visible and is required — it is what a
   screen reader announces. `caption` is editorial voice and is Erik's to write;
   the layouts are built to look correct while it is empty. `venue` and `when`
   are deliberately blank until someone who was in the room confirms them. */
const photo = z.object({
  slug: z.string(),
  alt: z.string(),
  caption: z.string().default(''),
  venue: z.string().default(''),
  when: z.string().default(''),
  orientation: z.enum(['landscape', 'portrait', 'square']).default('landscape'),
  hero: z.boolean().default(false),
  order: z.number().default(50),
});

const photos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/photos' }),
  schema: photo.extend({
    /* Which city this was taken in. Defaults to berlin so nothing breaks; set it
       properly on new photos so a city page never shows another city's room. */
    city: z.string().default('berlin'),
  }),
});

/* One file per city. `status` is the switch that decides what the site shows:
   - live    → gets a full city page, appears in the header switcher
   - planned → gets an honest recruitment page, does NOT appear in the switcher
   - paused  → archive stays readable, no next game day

   `order` picks the primary city — the one the home page renders. */
const cities = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cities' }),
  schema: z.object({
    name: z.string(),
    country: z.string(),
    status: z.enum(['live', 'planned', 'paused']),
    order: z.number().default(50),
    since: z.string().default(''),
    tagline: z.string().default(''),
    contact: z.string().default(''),
    discord: z.string().default(''),
    /* Who runs it. Empty is fine and renders as "we are looking for people". */
    team: z.array(z.object({ name: z.string(), role: z.string().default('') })).default([]),
    heroPhoto: z.string().default(''),
  }),
});

const session = z.object({
  table: z.number(),
  title: z.string(),
  system: z.string().optional(),
  level: z.string().optional(),
  gm: z.string(),
  start: z.string(),
  end: z.string(),
  seats: z.number().optional(),
  seatsLeft: z.number().optional(),
  full: z.boolean().default(false),
  waitlist: z.boolean().default(false),
  /* Practical labels: "Beginner friendly", "Pregens provided", "Played in German". */
  tags: z.array(z.string()).default([]),
  /* Content warnings are NOT tags. Keep to roughly three, naming only what the
     table cannot avoid — an exhaustive list drives people away rather than
     informing them. Rendered separately and always in the same place. */
  contentWarnings: z.array(z.string()).max(5).default([]),
  adultsOnly: z.boolean().default(false),
  blurb: z.string(),
});

const gamedays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gamedays' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    startTime: z.string(),
    endTime: z.string(),
    venue: z.string(),
    address: z.string(),
    city: z.string().default('Berlin'),
    entry: z.string(),
    capacity: z.number().optional(),
    spotsLeft: z.number().optional(),
    status: z.enum(['upcoming', 'open', 'past']),
    bookUrl: z.string().url().optional(),
    scheduleUrl: z.string().url().optional(),
    /* Access facts must be stated, not implied. Leave a field empty rather than
       guessing — an empty field renders as "we haven't confirmed this yet",
       which is honest; a wrong one strands somebody at the door. */
    access: z.object({
      stepFree: z.enum(['yes', 'no', 'unconfirmed']).default('unconfirmed'),
      notes: z.string().default(''),
      quietSpace: z.enum(['yes', 'no', 'unconfirmed']).default('unconfirmed'),
    }).default({}),
    photos: z.array(z.string()).default([]),
    sessions: z.array(session).default([]),
  }),
});

const gms = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gms' }),
  schema: z.object({
    name: z.string(),
    photo: z.string().optional(),
    runs: z.array(z.string()).default([]),
    since: z.string().optional(),
    order: z.number().default(50),
    /* A game master belongs to a city. Someone who runs in two gets two files. */
    city: z.string().default('berlin'),
  }),
});

export const collections = { gamedays, gms, photos, cities };
