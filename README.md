# Anime Database

A React app for browsing anime: Top Anime, This Season, Recommendations, a
Random picker, search with format filters and Load More pagination, a ranked
sidebar (Top Airing / Top Upcoming / Most Popular), and a detail page for
every title.

This version ports the working Muse web version of the site back into this
repo (Create React App + React Router + Tailwind CSS / daisyUI).

## Data sources

There is no backend and no API key. `src/api/animeApi.js` tries live sources
in order and normalizes everything to one entry shape:

1. **anime-mapper** — plain JSON files hosted on GitHub and served through
   the jsDelivr CDN (raw.githubusercontent.com as mirror), keyed by
   MyAnimeList ID: `homepage.json` for the curated lists, the ~30k-title
   `anime-index.json` for search and deeper Top Anime pages, and
   `data/anime/{bucket}/{malId}.json` for detail pages.
   https://github.com/subhajeetch-fl/anime-mapper
2. **AniList** — GraphQL API (https://graphql.anilist.co). Also the source
   for the sidebar's Top Upcoming list (anime-mapper's equivalent would need
   its full 12.6 MB index just for five rows) and for characters / Japanese
   voice actors on detail pages.
3. **Kitsu** — REST API (https://kitsu.io/api/edge).
4. **Snapshot fallback** — `src/data/snapshot.json`, 89 top/seasonal titles
   saved on Nov 10, 2026, with remote poster URLs. If every live source is
   unreachable the app serves the snapshot and shows a banner saying so,
   instead of sitting on a loading screen.

Jikan and AniDB are deliberately not used: Jikan (api.jikan.moe) timed out
with zero bytes returned, and AniDB's HTTP API requires a registered client,
sends no CORS headers, and its public feed has no scores or posters.

Notes:

- In anime-mapper mode there are no member/favorite counts, so those stats
  show as unavailable on detail pages.
- The old `REACT_APP_BASE_URL` value in `.env` pointed at Jikan and is no
  longer used by the code.

## Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode. Open
[http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm test`

Launches the test runner in interactive watch mode.

This project was bootstrapped with
[Create React App](https://github.com/facebook/create-react-app).
