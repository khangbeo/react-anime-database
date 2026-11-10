// Data layer for the Anime Database.
//
// Live sources are tried in this order for every view:
//   1. anime-mapper — plain JSON files hosted on GitHub, served through the
//      jsDelivr CDN (raw.githubusercontent.com as mirror). No API key, no
//      sign-up, CORS open. https://github.com/subhajeetch-fl/anime-mapper
//   2. AniList — GraphQL API (https://graphql.anilist.co), no key needed.
//   3. Kitsu — REST API (https://kitsu.io/api/edge), no key needed.
//   4. A baked-in snapshot of 89 top/seasonal titles (src/data/snapshot.json),
//      used only when every live source is unreachable. The UI shows a
//      banner whenever snapshot data is on screen.
//
// Jikan (api.jikan.moe) and AniDB are intentionally NOT used: Jikan was
// unreachable (requests timed out with zero bytes back) and AniDB's HTTP
// API needs a registered client, sends no CORS headers, and its public
// titles feed has no scores or posters.
//
// Every function resolves to { data, source } where source is one of
// "mapper" | "anilist" | "kitsu" | "snapshot", and every entry is
// normalized to the unified shape produced by the normalize* functions:
//   { malId, anilistId, kitsuId, title, romaji, type, status, airing,
//     score, rank, popularity, members, favorites, year, season,
//     episodes, episodeLength, rating, genres, studios, producers,
//     image, banner, synopsis, airedFrom, airedTo, trailerUrl,
//     relations, source }

import snapshot from "../data/snapshot.json";

export const PAGE_SIZE = 24;
const TIMEOUT_MS = 8000;
const INDEX_TIMEOUT_MS = 30000;

const MAPPER_BASES = [
  "https://cdn.jsdelivr.net/gh/subhajeetch-fl/anime-mapper@main/data",
  "https://raw.githubusercontent.com/subhajeetch-fl/anime-mapper/main/data",
];
const ANILIST_URL = "https://graphql.anilist.co";
const KITSU_BASE = "https://kitsu.io/api/edge";

export const FORMATS = ["All", "TV", "Movie", "OVA", "ONA", "Special"];

// ---------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------

async function fetchJSON(url, options = {}, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function pickScore(scoreObj) {
  if (!scoreObj) return null;
  return scoreObj.malScore ?? scoreObj.anilistScore ?? scoreObj.kitsuRating ?? null;
}

function trailerUrlFrom(trailer) {
  if (!trailer) return null;
  if (trailer.url) return trailer.url;
  if (trailer.youtubeId) return `https://www.youtube.com/watch?v=${trailer.youtubeId}`;
  if (trailer.id && trailer.site === "youtube")
    return `https://www.youtube.com/watch?v=${trailer.id}`;
  return null;
}

function currentSeason(date = new Date()) {
  const m = date.getMonth();
  const season = m < 3 ? "WINTER" : m < 6 ? "SPRING" : m < 9 ? "SUMMER" : "FALL";
  return { season, year: date.getFullYear(), lower: season.toLowerCase() };
}

// ---------------------------------------------------------------------------
// normalizers — one per source, all returning the unified entry shape
// ---------------------------------------------------------------------------

function baseEntry(partial) {
  return {
    malId: null,
    anilistId: null,
    kitsuId: null,
    title: "Unknown title",
    romaji: null,
    type: null,
    status: null,
    airing: false,
    score: null,
    rank: null,
    popularity: null,
    members: null,
    favorites: null,
    year: null,
    season: null,
    episodes: null,
    episodeLength: null,
    rating: null,
    genres: [],
    studios: [],
    producers: [],
    image: null,
    banner: null,
    synopsis: "",
    airedFrom: null,
    airedTo: null,
    trailerUrl: null,
    relations: [],
    characters: [],
    ...partial,
  };
}

export function normalizeMapper(e, source = "mapper") {
  if (!e) return null;
  const t = e.title || {};
  return baseEntry({
    malId: e.idMal ?? e.id ?? e.mappings?.mal ?? null,
    anilistId: e.mappings?.anilist ?? null,
    kitsuId: e.mappings?.kitsu ?? null,
    title: t.english || t.romaji || t.native || "Unknown title",
    romaji: t.romaji || null,
    type: e.type || null,
    status: e.status || null,
    airing: Boolean(e.airing),
    score: pickScore(e.score),
    year: e.year ?? null,
    season: e.season || null,
    episodes: e.episodeCount ?? null,
    episodeLength: e.episodeLength ?? null,
    rating: e.rating || null,
    genres: e.genres || [],
    studios: e.studios || [],
    producers: e.producers || [],
    image: e.images?.poster || null,
    banner: e.images?.banner || null,
    synopsis: e.synopsis || "",
    airedFrom: e.aired?.from || null,
    airedTo: e.aired?.to || null,
    trailerUrl: trailerUrlFrom(e.trailer),
    relations: (e.sequence || []).map((r) => ({
      malId: r.malId,
      title: r.title?.english || r.title?.romaji || "Unknown title",
      relationType: r.relationType,
      image: r.image || null,
    })),
    source,
  });
}

const INDEX_TYPE = {
  MOVIE: "Movie",
  SPECIAL: "Special",
  TV_SHORT: "TV Short",
  MUSIC: "Music",
};

function normalizeIndexEntry(e) {
  // anime-index.json rows are flat: { id, title, romajiTitle, nativeTitle,
  // year, season, type, status, episodeCount, image, score }
  // Its type strings are inconsistent ("MOVIE" vs "Movie", "TV_SHORT"),
  // so normalize them to the display forms the format filter uses.
  return baseEntry({
    malId: e.id,
    title: e.title || e.romajiTitle || "Unknown title",
    romaji: e.romajiTitle || null,
    type: INDEX_TYPE[e.type] || e.type || null,
    status: e.status || null,
    airing: e.status === "Currently Airing",
    score: e.score ?? null,
    year: e.year ?? null,
    season: e.season || null,
    episodes: e.episodeCount ?? null,
    image: e.image || null,
    source: "mapper",
  });
}

const ANILIST_FORMAT = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};
const ANILIST_STATUS = {
  RELEASING: "Currently Airing",
  FINISHED: "Finished Airing",
  NOT_YET_RELEASED: "Not yet aired",
  CANCELLED: "Cancelled",
  HIATUS: "Hiatus",
};

export function normalizeAnilist(m) {
  if (!m) return null;
  return baseEntry({
    malId: m.idMal ?? null,
    anilistId: m.id ?? null,
    title: m.title?.english || m.title?.romaji || "Unknown title",
    romaji: m.title?.romaji || null,
    type: ANILIST_FORMAT[m.format] || m.format || null,
    status: ANILIST_STATUS[m.status] || m.status || null,
    airing: m.status === "RELEASING",
    score: m.averageScore != null ? m.averageScore / 10 : null,
    rank: m.rankings?.find((r) => r.type === "RATED" && r.allTime)?.rank ?? null,
    popularity:
      m.rankings?.find((r) => r.type === "POPULAR" && r.allTime)?.rank ?? null,
    members: m.popularity ?? null,
    favorites: m.favourites ?? null,
    year: m.seasonYear ?? m.startDate?.year ?? null,
    season: m.season ? m.season.toLowerCase() : null,
    episodes: m.episodes ?? null,
    episodeLength: m.duration ?? null,
    genres: m.genres || [],
    studios: (m.studios?.nodes || []).map((s) => s.name),
    image: m.coverImage?.extraLarge || m.coverImage?.large || null,
    banner: m.bannerImage || null,
    synopsis: (m.description || "").replace(/<[^>]+>/g, ""),
    airedFrom: m.startDate?.year
      ? `${m.startDate.year}-${String(m.startDate.month || 1).padStart(2, "0")}-${String(m.startDate.day || 1).padStart(2, "0")}`
      : null,
    airedTo: m.endDate?.year
      ? `${m.endDate.year}-${String(m.endDate.month || 1).padStart(2, "0")}-${String(m.endDate.day || 1).padStart(2, "0")}`
      : null,
    trailerUrl: m.trailer?.id
      ? `https://www.youtube.com/watch?v=${m.trailer.id}`
      : null,
    relations: (m.relations?.edges || []).map((edge) => ({
      malId: edge.node?.idMal ?? null,
      title: edge.node?.title?.english || edge.node?.title?.romaji || "Unknown title",
      relationType: edge.relationType,
      image: edge.node?.coverImage?.medium || null,
    })),
    characters: (m.characters?.edges || []).map((edge) => ({
      name: edge.node?.name?.full || "Unknown",
      role: edge.role || null,
      image: edge.node?.image?.medium || null,
      voiceActor: edge.voiceActors?.[0]?.name?.full || null,
    })),
    source: "anilist",
  });
}

const KITSU_TYPE = {
  tv: "TV",
  movie: "Movie",
  ova: "OVA",
  ona: "ONA",
  special: "Special",
  music: "Music",
};
const KITSU_STATUS = {
  current: "Currently Airing",
  finished: "Finished Airing",
  upcoming: "Not yet aired",
  unreleased: "Not yet aired",
  tba: "Not yet aired",
};

export function normalizeKitsu(item, includedGenres) {
  if (!item) return null;
  const a = item.attributes || {};
  return baseEntry({
    malId: null, // Kitsu ids are its own; detail lookup maps MAL <-> Kitsu
    kitsuId: item.id,
    title: a.titles?.en || a.titles?.en_jp || a.canonicalTitle || "Unknown title",
    romaji: a.titles?.en_jp || null,
    type: KITSU_TYPE[a.showType] || a.showType || null,
    status: KITSU_STATUS[a.status] || a.status || null,
    airing: a.status === "current",
    score: a.averageRating ? Number(a.averageRating) / 10 : null,
    rank: a.ratingRank ?? null,
    popularity: a.popularityRank ?? null,
    members: a.userCount ?? null,
    favorites: a.favoritesCount ?? null,
    year: a.startDate ? Number(String(a.startDate).slice(0, 4)) : null,
    episodes: a.episodeCount ?? null,
    episodeLength: a.episodeLength ?? null,
    rating: a.ageRating ? `${a.ageRating}${a.ageRatingGuide ? ` - ${a.ageRatingGuide}` : ""}` : null,
    genres: includedGenres || [],
    image: a.posterImage?.large || a.posterImage?.original || null,
    banner: a.coverImage?.large || null,
    synopsis: a.synopsis || "",
    airedFrom: a.startDate || null,
    airedTo: a.endDate || null,
    trailerUrl: a.youtubeVideoId
      ? `https://www.youtube.com/watch?v=${a.youtubeVideoId}`
      : null,
    source: "kitsu",
  });
}

export function normalizeSnapshot(t) {
  return baseEntry({
    malId: t.malId,
    anilistId: t.anilistId ?? null,
    kitsuId: t.kitsuId ?? null,
    title: t.title,
    romaji: t.romaji || null,
    type: t.type || null,
    status: t.status || null,
    airing: Boolean(t.airing),
    score: t.score ?? null,
    year: t.year ?? null,
    season: t.season || null,
    episodes: t.episodes ?? null,
    episodeLength: t.episodeLength ?? null,
    rating: t.rating || null,
    genres: t.genres || [],
    studios: t.studios || [],
    producers: t.producers || [],
    image: t.image || null,
    banner: t.banner || null,
    synopsis: t.synopsis || "",
    airedFrom: t.aired?.from || null,
    airedTo: t.aired?.to || null,
    trailerUrl: t.trailerUrl || null,
    relations: t.relations || [],
    ranks: t.ranks || {},
    source: "snapshot",
  });
}

const snapshotTitles = snapshot.titles.map(normalizeSnapshot);

// ---------------------------------------------------------------------------
// anime-mapper (source 1)
// ---------------------------------------------------------------------------

let homepagePromise = null;
function getMapperHomepage() {
  if (!homepagePromise) {
    homepagePromise = (async () => {
      let lastErr;
      for (const base of MAPPER_BASES) {
        try {
          return await fetchJSON(`${base}/homepage.json`);
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr;
    })();
    homepagePromise.catch(() => {
      homepagePromise = null;
    });
  }
  return homepagePromise;
}

let indexPromise = null;
function getMapperIndex() {
  if (!indexPromise) {
    indexPromise = (async () => {
      let lastErr;
      for (const base of MAPPER_BASES) {
        try {
          const raw = await fetchJSON(`${base}/anime-index.json`, {}, INDEX_TIMEOUT_MS);
          return raw.map(normalizeIndexEntry);
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr;
    })();
    indexPromise.catch(() => {
      indexPromise = null;
    });
  }
  return indexPromise;
}

function bucketFor(malId) {
  if (malId >= 1000000) return "other";
  return String(Math.floor(malId / 1000)).padStart(3, "0");
}

async function getMapperDetail(malId) {
  let lastErr;
  for (const base of MAPPER_BASES) {
    try {
      const raw = await fetchJSON(`${base}/anime/${bucketFor(malId)}/${malId}.json`);
      return normalizeMapper(raw);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

function homepageSection(home, key) {
  const v = home?.[key];
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.results)) return v.results;
  return [];
}

function mapperPool(home) {
  const seen = new Map();
  for (const key of ["topRated", "thisSeasonPopular", "mostPopular", "trending", "mostWatched", "latestEpisodes", "spotlight"]) {
    for (const e of homepageSection(home, key)) {
      const n = normalizeMapper(e);
      if (n && n.malId != null && !seen.has(n.malId)) seen.set(n.malId, n);
    }
  }
  return [...seen.values()];
}

// ---------------------------------------------------------------------------
// AniList (source 2)
// ---------------------------------------------------------------------------

const ANILIST_FIELDS = `
  id idMal title { english romaji } format status season seasonYear
  averageScore popularity favourites episodes duration genres
  coverImage { extraLarge large } bannerImage description
  startDate { year month day } endDate { year month day }
  trailer { id } studios(isMain: true) { nodes { name } }
  rankings { rank type allTime }
  relations { edges { relationType node { idMal title { english romaji } coverImage { medium } } } }
`;

// Detail pages additionally pull characters + Japanese voice actors
// (only AniList exposes them among the sources used here).
const ANILIST_DETAIL_FIELDS = `
  id idMal title { english romaji } format status season seasonYear
  averageScore popularity favourites episodes duration genres
  coverImage { extraLarge large } bannerImage description
  startDate { year month day } endDate { year month day }
  trailer { id } studios(isMain: true) { nodes { name } }
  rankings { rank type allTime }
  relations { edges { relationType node { idMal title { english romaji } coverImage { medium } } } }
  characters(page: 1, perPage: 12, sort: ROLE) { edges { role node { name { full } image { medium } } voiceActors(language: JAPANESE) { name { full } } } }
`;

async function anilistQuery(query, variables) {
  const json = await fetchJSON(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (json.errors) throw new Error("AniList GraphQL error");
  return json.data;
}

async function anilistPage(args, page = 1, perPage = PAGE_SIZE) {
  // Build the argument list with only the arguments actually used — AniList
  // returns empty pages when optional variables are passed as null.
  // Note: Page itself only takes page/perPage; every filter/sort argument
  // belongs on Page.media(...).
  const varDefs = ["$page: Int", "$perPage: Int"];
  const mediaArgs = ["type: ANIME"];
  const variables = { page, perPage };
  for (const [key, value] of Object.entries(args)) {
    if (value === undefined || value === null) continue;
    variables[key] = value;
    const type =
      key === "seasonYear" ? "Int" : key === "season" ? "MediaSeason" : key === "format" ? "MediaFormat" : key === "status" ? "MediaStatus" : key === "search" ? "String" : "[MediaSort]";
    varDefs.push(`$${key}: ${type}`);
    mediaArgs.push(`${key}: $${key}`);
  }
  const data = await anilistQuery(
    `query (${varDefs.join(", ")}) { Page(page: $page, perPage: $perPage) { pageInfo { hasNextPage total } media(${mediaArgs.join(", ")}) { ${ANILIST_FIELDS} } } }`,
    variables
  );
  return {
    media: (data.Page.media || []).map(normalizeAnilist),
    hasNextPage: Boolean(data.Page.pageInfo?.hasNextPage),
  };
}

// ---------------------------------------------------------------------------
// Kitsu (source 3)
// ---------------------------------------------------------------------------

async function kitsuList(params, page = 1, limit = PAGE_SIZE) {
  const offset = (page - 1) * limit;
  const qs = new URLSearchParams({
    ...params,
    "page[limit]": String(Math.min(limit, 20)), // Kitsu rejects page sizes > 20
    "page[offset]": String(offset),
  });
  const json = await fetchJSON(`${KITSU_BASE}/anime?${qs.toString()}`, {
    headers: { Accept: "application/vnd.api+json" },
  });
  const items = (json.data || []).map((item) => normalizeKitsu(item));
  return { media: items, hasNextPage: Boolean(json.links?.next) };
}

async function kitsuDetailByMalId(malId) {
  // Map a MAL id to a Kitsu entry through Kitsu's mappings endpoint.
  const map = await fetchJSON(
    `${KITSU_BASE}/mappings?filter[externalSite]=myanimelist/anime&filter[externalId]=${malId}&include=item`,
    { headers: { Accept: "application/vnd.api+json" } }
  );
  const item = (map.included || []).find((i) => i.type === "anime");
  if (!item) throw new Error("No Kitsu mapping for this title");
  // Kitsu's /genres relation is empty for most titles; /categories is the
  // populated one (its label field is `title`, not `name`).
  let genres = [];
  try {
    const g = await fetchJSON(`${KITSU_BASE}/anime/${item.id}/categories?page[limit]=20`, {
      headers: { Accept: "application/vnd.api+json" },
    });
    genres = (g.data || []).map((x) => x.attributes.title).filter(Boolean);
  } catch {
    genres = [];
  }
  return normalizeKitsu(item, genres);
}

// ---------------------------------------------------------------------------
// snapshot (source 4, fallback only)
// ---------------------------------------------------------------------------

function snapshotSortedByScore(list) {
  return [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

const snapshotSource = {
  top(page) {
    const byRank = [...snapshotTitles].sort(
      (a, b) => (a.ranks.top ?? 999) - (b.ranks.top ?? 999) || (b.score ?? 0) - (a.score ?? 0)
    );
    return paginate(byRank, page);
  },
  season(page) {
    const byRank = [...snapshotTitles].sort(
      (a, b) => (a.ranks.season ?? 999) - (b.ranks.season ?? 999) || (b.score ?? 0) - (a.score ?? 0)
    );
    return paginate(byRank, page);
  },
  popular() {
    return [...snapshotTitles]
      .sort((a, b) => (a.ranks.popular ?? 999) - (b.ranks.popular ?? 999))
      .slice(0, 5);
  },
  airing() {
    return snapshotSortedByScore(snapshotTitles.filter((t) => t.airing)).slice(0, 5);
  },
  upcoming() {
    return snapshotSortedByScore(
      snapshotTitles.filter((t) => /not yet aired/i.test(t.status || ""))
    ).slice(0, 5);
  },
  search(query, format, page) {
    const q = query.trim().toLowerCase();
    let hits = snapshotTitles.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.romaji || "").toLowerCase().includes(q)
    );
    if (format && format !== "All") hits = hits.filter((t) => t.type === format);
    return { ...paginate(snapshotSortedByScore(hits), page), total: hits.length };
  },
  detail(malId) {
    return snapshotTitles.find((t) => t.malId === Number(malId)) || null;
  },
  pool() {
    return snapshotTitles;
  },
};

function paginate(list, page, perPage = PAGE_SIZE) {
  const start = (page - 1) * perPage;
  return {
    media: list.slice(start, start + perPage),
    hasNextPage: start + perPage < list.length,
    total: list.length,
  };
}

// ---------------------------------------------------------------------------
// recommendations — paired by shared genres in mapper/snapshot modes,
// real AniList user recommendations when AniList is the live source
// ---------------------------------------------------------------------------

function genrePairs(pool, limit = 20) {
  const pairs = [];
  const sorted = snapshotSortedByScore(pool);
  for (let i = 0; i < sorted.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < sorted.length && pairs.length < limit; j++) {
      const a = sorted[i];
      const b = sorted[j];
      const shared = a.genres.filter((g) => b.genres.includes(g));
      if (shared.length >= 2) pairs.push({ entry: a, recommended: b, shared });
    }
  }
  return pairs;
}

async function anilistRecommendations() {
  const data = await anilistQuery(
    `query { Page(page: 1, perPage: 20) { recommendations(sort: ID_DESC) {
      media { ${ANILIST_FIELDS} }
      mediaRecommendation { ${ANILIST_FIELDS} }
    } } }`,
    {}
  );
  return (data.Page.recommendations || [])
    .filter((r) => r.media && r.mediaRecommendation)
    .map((r) => ({
      entry: normalizeAnilist(r.media),
      recommended: normalizeAnilist(r.mediaRecommendation),
      shared: [],
    }));
}

// ---------------------------------------------------------------------------
// public API — every view goes mapper -> anilist -> kitsu -> snapshot
// ---------------------------------------------------------------------------

async function withFallback(attempts) {
  let lastErr;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export async function getTopAnime(page = 1) {
  return withFallback([
    async () => {
      if (page === 1) {
        const home = await getMapperHomepage();
        const media = homepageSection(home, "topRated").map((e) => normalizeMapper(e));
        if (!media.length) throw new Error("mapper: empty topRated");
        return { data: { media, hasNextPage: true, total: null }, source: "mapper" };
      }
      const index = await getMapperIndex();
      const sorted = snapshotSortedByScore(index);
      // Page 1 came from the curated topRated list; deeper pages continue
      // through the full index sorted by score, skipping the first page.
      const rest = sorted.slice(PAGE_SIZE);
      return { data: { ...paginate(rest, page - 1), total: sorted.length }, source: "mapper" };
    },
    async () => ({
      data: await anilistPage({ sort: ["SCORE_DESC"] }, page),
      source: "anilist",
    }),
    async () => ({
      data: await kitsuList({ sort: "-averageRating" }, page),
      source: "kitsu",
    }),
    async () => ({ data: snapshotSource.top(page), source: "snapshot" }),
  ]);
}

export async function getSeasonAnime(page = 1) {
  const { season, year, lower } = currentSeason();
  return withFallback([
    async () => {
      if (page === 1) {
        const home = await getMapperHomepage();
        const media = homepageSection(home, "thisSeasonPopular").map((e) => normalizeMapper(e));
        if (!media.length) throw new Error("mapper: empty thisSeasonPopular");
        return { data: { media, hasNextPage: true, total: null }, source: "mapper" };
      }
      const index = await getMapperIndex();
      const inSeason = index.filter((t) => t.year === year && (t.season || "") === lower);
      return { data: paginate(snapshotSortedByScore(inSeason), page), source: "mapper" };
    },
    async () => ({
      data: await anilistPage({ season, seasonYear: year, sort: ["POPULARITY_DESC"] }, page),
      source: "anilist",
    }),
    async () => ({
      data: await kitsuList(
        { "filter[season]": lower, "filter[seasonYear]": String(year), sort: "-userCount" },
        page
      ),
      source: "kitsu",
    }),
    async () => ({ data: snapshotSource.season(page), source: "snapshot" }),
  ]);
}

export async function getRecommendations() {
  return withFallback([
    async () => {
      const home = await getMapperHomepage();
      const pairs = genrePairs(mapperPool(home));
      if (!pairs.length) throw new Error("mapper: no recommendation pairs");
      return { data: pairs, source: "mapper" };
    },
    async () => ({ data: await anilistRecommendations(), source: "anilist" }),
    async () => {
      const { media } = await kitsuList({ sort: "-userCount" }, 1);
      const pairs = genrePairs(media);
      if (!pairs.length) throw new Error("kitsu: no recommendation pairs");
      return { data: pairs, source: "kitsu" };
    },
    async () => ({ data: genrePairs(snapshotTitles), source: "snapshot" }),
  ]);
}

export async function searchAnime(query, format = "All", page = 1) {
  const mapperFormat = format === "All" ? null : format;
  return withFallback([
    async () => {
      const index = await getMapperIndex();
      const q = query.trim().toLowerCase();
      let hits = index.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.romaji || "").toLowerCase().includes(q)
      );
      if (mapperFormat) hits = hits.filter((t) => t.type === mapperFormat);
      hits = snapshotSortedByScore(hits);
      return { data: { ...paginate(hits, page), total: hits.length }, source: "mapper" };
    },
    async () => {
      const args = { search: query, sort: ["SEARCH_MATCH"] };
      if (mapperFormat) {
        const fmt = Object.keys(ANILIST_FORMAT).find((k) => ANILIST_FORMAT[k] === mapperFormat);
        if (fmt) args.format = fmt;
      }
      const data = await anilistPage(args, page);
      return { data, source: "anilist" };
    },
    async () => {
      const params = { "filter[text]": query, sort: "-userCount" };
      const data = await kitsuList(params, page);
      const media = mapperFormat ? data.media.filter((t) => t.type === mapperFormat) : data.media;
      return { data: { ...data, media }, source: "kitsu" };
    },
    async () => ({ data: snapshotSource.search(query, format, page), source: "snapshot" }),
  ]);
}

export async function getSidebarLists() {
  // Top Airing / Most Popular come from anime-mapper's homepage lists.
  // Top Upcoming uses AniList first: anime-mapper's answer would mean
  // downloading its full 12.6 MB index just to render five sidebar rows,
  // unless the index is already cached from search / Top Anime page 2+.
  const result = { airing: [], upcoming: [], popular: [], source: "snapshot" };
  const note = (source) => {
    if (result.source === "snapshot" && source !== "snapshot") result.source = source;
    if (source === "snapshot") result.usedSnapshot = true;
  };

  try {
    const home = await getMapperHomepage();
    const pool = mapperPool(home);
    result.airing = snapshotSortedByScore(pool.filter((t) => t.airing)).slice(0, 5);
    result.popular = homepageSection(home, "mostPopular")
      .map((e) => normalizeMapper(e))
      .slice(0, 5);
    if (result.airing.length) note("mapper");
    if (result.popular.length) note("mapper");
  } catch {
    /* fall through to AniList */
  }

  if (!result.airing.length || !result.popular.length) {
    try {
      if (!result.airing.length) {
        const { media } = await anilistPage({ status: undefined, sort: ["POPULARITY_DESC"] }, 1, 25);
        result.airing = media.filter((t) => t.airing).slice(0, 5);
        if (result.airing.length) note("anilist");
      }
      if (!result.popular.length) {
        const { media } = await anilistPage({ sort: ["POPULARITY_DESC"] }, 1, 5);
        result.popular = media;
        if (media.length) note("anilist");
      }
    } catch {
      /* fall through */
    }
  }

  try {
    const { season, year } = currentSeason();
    void season;
    void year;
    const data = await anilistQuery(
      `query { Page(page: 1, perPage: 5) { media(type: ANIME, status: NOT_YET_RELEASED, sort: POPULARITY_DESC) { ${ANILIST_FIELDS} } } }`,
      {}
    );
    result.upcoming = (data.Page.media || []).map(normalizeAnilist);
    if (result.upcoming.length) note("anilist");
  } catch {
    try {
      const { media } = await kitsuList({ "filter[status]": "upcoming", sort: "-userCount" }, 1, 5);
      // Kitsu rows have no MAL id; sidebar links need one, so only keep
      // rows we can link — otherwise use the snapshot's upcoming list.
      result.upcoming = media.filter((t) => t.malId != null);
      if (!result.upcoming.length) throw new Error("kitsu upcoming not linkable");
      note("kitsu");
    } catch {
      result.upcoming = snapshotSource.upcoming();
      note("snapshot");
    }
  }

  if (!result.airing.length) {
    result.airing = snapshotSource.airing();
    note("snapshot");
  }
  if (!result.popular.length) {
    result.popular = snapshotSource.popular();
    note("snapshot");
  }
  return result;
}

export async function getRandomAnime() {
  return withFallback([
    async () => {
      const home = await getMapperHomepage();
      const pool = mapperPool(home);
      if (!pool.length) throw new Error("mapper: empty pool");
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const detail = await getMapperDetail(pick.malId).catch(() => pick);
      return { data: detail, source: "mapper" };
    },
    async () => {
      const randomPage = Math.floor(Math.random() * 50) + 1;
      const { media } = await anilistPage({ sort: ["POPULARITY_DESC"] }, randomPage, 1);
      if (!media.length) throw new Error("anilist: empty random page");
      return { data: media[0], source: "anilist" };
    },
    async () => {
      const { media } = await kitsuList({ sort: "-userCount" }, Math.floor(Math.random() * 20) + 1, 1);
      if (!media.length || media[0].malId == null) throw new Error("kitsu: random not linkable");
      return { data: media[0], source: "kitsu" };
    },
    async () => {
      const pick = snapshotTitles[Math.floor(Math.random() * snapshotTitles.length)];
      return { data: pick, source: "snapshot" };
    },
  ]);
}

export async function getAnimeDetail(malId) {
  const id = Number(malId);
  return withFallback([
    async () => ({ data: await getMapperDetail(id), source: "mapper" }),
    async () => {
      const data = await anilistQuery(
        `query ($idMal: Int) { Media(idMal: $idMal, type: ANIME) { ${ANILIST_DETAIL_FIELDS} } }`,
        { idMal: id }
      );
      if (!data.Media) throw new Error("anilist: not found");
      return { data: normalizeAnilist(data.Media), source: "anilist" };
    },
    async () => ({ data: await kitsuDetailByMalId(id), source: "kitsu" }),
    async () => {
      const found = snapshotSource.detail(id);
      if (!found) throw new Error("snapshot: not in snapshot");
      return { data: found, source: "snapshot" };
    },
  ]);
}

export const snapshotMeta = {
  generatedAt: snapshot.generatedAt,
  count: snapshot.count,
};
