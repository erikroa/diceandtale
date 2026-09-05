import { getCollection, type CollectionEntry } from 'astro:content';

export type City = CollectionEntry<'cities'>;

/** All cities, most established first. */
export async function allCities(): Promise<City[]> {
  return (await getCollection('cities')).sort((a, b) => a.data.order - b.data.order);
}

/** Cities actually running game days. */
export async function liveCities(): Promise<City[]> {
  return (await allCities()).filter(c => c.data.status === 'live');
}

/**
 * The city the site leads with — the lowest-order live one.
 * While there is only one, "/" is that city and no switcher appears anywhere.
 */
export async function primaryCity(): Promise<City> {
  const live = await liveCities();
  if (live.length === 0) {
    throw new Error(
      'No city has `status: "live"`. Set it on one file in src/content/cities/ ' +
      'or the site has no home page to render.'
    );
  }
  return live[0];
}

/**
 * Where a live city's page lives. The primary city owns "/" so the strongest
 * page keeps the strongest URL; the others get their own path.
 */
export async function cityHref(city: City): Promise<string> {
  const primary = await primaryCity();
  return city.id === primary.id ? '/' : `/${city.id}`;
}
