import { createContext, useCallback, useEffect, useRef, useState } from "react";
import {
  FORMATS,
  getRandomAnime,
  getRecommendations,
  getSeasonAnime,
  getSidebarLists,
  getTopAnime,
  searchAnime,
  snapshotMeta,
} from "../api/animeApi";

const AnimeContext = createContext();

export function AnimeProvider({ children }) {
  // Main view state. view is one of: "top" | "season" | "recommendations" | "search"
  const [view, setView] = useState("top");
  const [animeList, setAnimeList] = useState([]);
  const [recPairs, setRecPairs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Search state
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [format, setFormat] = useState("All");

  // Sidebar state
  const [topPopular, setTopPopular] = useState([]);
  const [topAiring, setTopAiring] = useState([]);
  const [topUpcoming, setTopUpcoming] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  // Which live source actually answered, and whether the snapshot is showing
  const [liveSource, setLiveSource] = useState(null);
  const [snapshotMode, setSnapshotMode] = useState(false);

  const requestId = useRef(0);

  const noteSource = useCallback((source) => {
    setLiveSource(source);
    if (source === "snapshot") setSnapshotMode(true);
  }, []);

  const loadView = useCallback(
    async (nextView, { query = "", fmt = "All", append = false, pageNum = 1 } = {}) => {
      const id = ++requestId.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        let result;
        if (nextView === "top") result = await getTopAnime(pageNum);
        else if (nextView === "season") result = await getSeasonAnime(pageNum);
        else if (nextView === "recommendations") result = await getRecommendations();
        else result = await searchAnime(query, fmt, pageNum);

        if (id !== requestId.current) return; // a newer request won
        noteSource(result.source);

        if (nextView === "recommendations") {
          setRecPairs(result.data);
          setAnimeList([]);
          setHasMore(false);
          setTotal(null);
        } else {
          const { media, hasNextPage, total: t } = result.data;
          setAnimeList((prev) => (append ? [...prev, ...media] : media));
          setHasMore(Boolean(hasNextPage));
          setTotal(t ?? null);
          setPage(pageNum);
        }
      } catch {
        if (id !== requestId.current) return;
        // Every source failed (should not happen — the snapshot is local —
        // but keep the UI honest if it ever does).
        if (!append) {
          setAnimeList([]);
          setRecPairs([]);
        }
        setHasMore(false);
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [noteSource]
  );

  const showTop = useCallback(() => {
    setView("top");
    loadView("top", { pageNum: 1 });
  }, [loadView]);

  const showSeason = useCallback(() => {
    setView("season");
    loadView("season", { pageNum: 1 });
  }, [loadView]);

  const showRecommendations = useCallback(() => {
    setView("recommendations");
    loadView("recommendations");
  }, [loadView]);

  const runSearch = useCallback(
    (query, fmt = format) => {
      const q = (query ?? search).trim();
      if (!q) return;
      setActiveQuery(q);
      setView("search");
      loadView("search", { query: q, fmt, pageNum: 1 });
    },
    [loadView, search, format]
  );

  const changeFormat = useCallback(
    (fmt) => {
      setFormat(fmt);
      if (view === "search" && activeQuery) {
        loadView("search", { query: activeQuery, fmt, pageNum: 1 });
      }
    },
    [loadView, view, activeQuery]
  );

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const next = page + 1;
    if (view === "top") loadView("top", { pageNum: next, append: true });
    else if (view === "season") loadView("season", { pageNum: next, append: true });
    else if (view === "search")
      loadView("search", { query: activeQuery, fmt: format, pageNum: next, append: true });
  }, [loading, loadingMore, hasMore, page, view, activeQuery, format, loadView]);

  const pickRandom = useCallback(async () => {
    const result = await getRandomAnime();
    noteSource(result.source);
    return result.data; // unified entry; caller navigates to /anime/:malId
  }, [noteSource]);

  // Initial loads: Top Anime as the home view, plus the sidebar lists.
  useEffect(() => {
    loadView("top", { pageNum: 1 });
    (async () => {
      try {
        const lists = await getSidebarLists();
        setTopAiring(lists.airing);
        setTopUpcoming(lists.upcoming);
        setTopPopular(lists.popular);
        if (lists.usedSnapshot) setSnapshotMode(true);
        else if (lists.source) setLiveSource((prev) => prev ?? lists.source);
      } finally {
        setSidebarLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navLinks = [
    { id: 0, name: "Top Anime", view: "top" },
    { id: 1, name: "This Season", view: "season" },
    { id: 2, name: "Recommendations", view: "recommendations" },
    { id: 3, name: "Random", view: "random" },
  ];

  return (
    <AnimeContext.Provider
      value={{
        // view + data
        view,
        animeList,
        recPairs,
        loading,
        loadingMore,
        hasMore,
        total,
        // search
        search,
        setSearch,
        activeQuery,
        format,
        formats: FORMATS,
        changeFormat,
        runSearch,
        // actions
        showTop,
        showSeason,
        showRecommendations,
        loadMore,
        pickRandom,
        // sidebar
        topPopular,
        topAiring,
        topUpcoming,
        sidebarLoading,
        loadingSidebar: sidebarLoading,
        // source status
        liveSource,
        snapshotMode,
        snapshotMeta,
        navLinks,
      }}
    >
      {children}
    </AnimeContext.Provider>
  );
}
export default AnimeContext;
