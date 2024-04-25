import { z } from "zod";
import { LRUCache } from "lru-cache";
import consola from "consola";

const BASE_URL = new URL("https://jsonplaceholder.typicode.com");

const Schema = z.object({
  albumId: z.number(),
  id: z.number(),
  title: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url(),
});

export const photosList = new LRUCache<number, Photo[]>({
  max: 500, // 500 is the max number of pages in the API
  ttl: Number.MAX_SAFE_INTEGER, // basically never expire it
});

export async function fetchPhotos(page: number | null, signal?: AbortSignal) {
  if (!page) page = 1; // default to page 1

  let cached = photosList.get(page);
  if (cached) {
    consola.success(`Fetched photos (page: ${page}) from cache`);
    return cached;
  }

  let url = new URL("/photos", BASE_URL);
  if (page) url.searchParams.set("_page", page.toString());
  url.searchParams.set("limit", "10 ");

  let response = await fetch(url, { signal });

  let photos = await Schema.array().promise().parse(response.json());

  photosList.set(page, photos);

  consola.success(`Fetched photos (page: ${page}) from network`);

  return photos;
}

export type Photo = z.output<typeof Schema>;
