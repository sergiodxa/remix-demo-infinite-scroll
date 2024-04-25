import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  Form,
  PrefetchPageLinks,
  useLoaderData,
  useLocation,
  useSubmit,
} from "@remix-run/react";
import { Suspense, useEffect, useRef } from "react";
import { z } from "zod";
import { ClientOnly } from "remix-utils/client-only";
import { Photo, fetchPhotos } from "./model";

type LoaderData = {
  pages: Array<{ page: number; data: Promise<Array<Photo>> }>;
  nextPage: number;
};

export async function loader({ request }: LoaderFunctionArgs) {
  let url = new URL(request.url);

  let page = z.coerce.number().parse(url.searchParams.get("page") ?? 1);

  let pages = Array.from({ length: page }, (_, i) => i + 1).map((page) => {
    return { page, data: fetchPhotos(page, request.signal) };
  });

  return { pages, nextPage: page + 1 };
}

export default function Components() {
  let { pages } = useLoaderData() as LoaderData;

  return (
    <main>
      <header>
        <h1>Single Fetch</h1>
        <p>
          This demo uses the (unstable) Single Fetch feature to send an array of
          pages from the loader, each page has a page number and data that's a
          promise, this promise is awaited inside the list using Suspense so we
          don't block navigation.
        </p>
        <p>
          The example shows a "Load next page" button inside a Form and it
          detects when it comes into the viewport to submit the form and
          automatically load the next page.
        </p>
        <p>
          Additionally, the example uses `PrefetchPageLinks` component to
          preload the following page, so if the user is currently of page 2, it
          will preload page 3, when the user finally needs page 3 it will load
          from cache so navigation is immediate.
        </p>
        <p>
          A downside of this approach is that if the user reaches page 15 we're
          fetching again every page from page 1 to 15, making 15 requests, to
          avoid this the route has an in-memory cache so we only really load
          from the network each page once.
          <br />
          Still even with the cache helping solve the re-fetch problem, we're
          still sending the data back to the browser even if it already has it,
          this give us the ability to reload the page and don't lose previously
          loaded pages but consume more data, it's a trade-off.
        </p>
      </header>

      <ol>
        {pages.map(({ page, data }) => {
          return (
            <Suspense key={page} fallback={<Loading page={page} />}>
              <Await resolve={data} errorElement={<ErrorUI page={page} />}>
                {(photos) => {
                  return photos.map((photo) => {
                    return (
                      <li key={photo.id}>
                        <img src={photo.thumbnailUrl} alt={photo.title} />
                        <p>{photo.title}</p>
                      </li>
                    );
                  });
                }}
              </Await>
            </Suspense>
          );
        })}
      </ol>

      <LoadNextPageForm />

      <PreloadNextPage />
    </main>
  );
}

function Loading({ page }: { page: number }) {
  return <p>Loading page {page}</p>;
}

function ErrorUI({ page }: { page: number }) {
  return <p>Failed to load page {page}</p>;
}

function LoadNextPageForm() {
  let { nextPage } = useLoaderData() as LoaderData;

  let formRef = useRef<HTMLFormElement>(null);

  let submit = useSubmit();

  useEffect(() => {
    let $form = formRef.current;
    if (!$form) return;

    let observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        submit($form, { preventScrollReset: true });
      }
    });

    observer.observe($form);
    return () => observer.disconnect();
  }, [submit]);

  return (
    <Form ref={formRef} preventScrollReset>
      <input type="hidden" name="page" value={nextPage} />
      <button>Load next page</button>
    </Form>
  );
}

function PreloadNextPage() {
  let { nextPage } = useLoaderData() as LoaderData;

  let location = useLocation();
  let nextUrl = `${location.pathname}?page=${nextPage}`;

  return <ClientOnly>{() => <PrefetchPageLinks page={nextUrl} />}</ClientOnly>;
}
