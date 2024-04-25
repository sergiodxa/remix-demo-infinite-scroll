import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Remix + Infinite Scroll Pagination</h1>
      <ul>
        <li>
          <Link to="/single-fetch" prefetch="intent">
            Single Fetch Pagination
          </Link>
          <p>
            Using (unstable) Single Fetch and a in-memory cache to load the list
            of pages while supporting reloading and keeping the same list, each
            page is loaded using Suspense to get fast response times.
          </p>
        </li>
      </ul>

      <p>More approaches will be added eventually</p>
    </div>
  );
}
