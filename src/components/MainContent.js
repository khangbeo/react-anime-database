import AnimeCard from "./AnimeCard";
import AnimeContext from "../context/AnimeContext";
import { useContext } from "react";
import { Link } from "react-router-dom";

const VIEW_TITLES = {
  top: "Top Anime",
  season: "This Season",
  recommendations: "Recommendations",
  search: "Search Results",
};

const SOURCE_LABELS = {
  mapper: "anime-mapper",
  anilist: "AniList",
  kitsu: "Kitsu",
  snapshot: "snapshot",
};

export default function MainContent() {
  const {
    view,
    animeList,
    recPairs,
    loading,
    loadingMore,
    hasMore,
    total,
    loadMore,
    activeQuery,
    format,
    formats,
    changeFormat,
    liveSource,
    snapshotMode,
    snapshotMeta,
  } = useContext(AnimeContext);

  return (
    <main className="mx-auto w-full md:overflow-y-auto h-screen px-2">
      {snapshotMode && (
        <div className="alert alert-warning shadow-lg my-4">
          <span>
            Live data couldn't be reached, so you're seeing a snapshot of top and
            seasonal titles saved on Nov 10, 2026 ({snapshotMeta.count} titles).
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 mx-2">
        <h2 className="text-3xl font-bold">
          {view === "search" ? `Results for "${activeQuery}"` : VIEW_TITLES[view]}
        </h2>
        <div className="flex items-center gap-3">
          {view === "search" && total != null && (
            <span className="opacity-70">{total.toLocaleString()} results</span>
          )}
          {liveSource && (
            <span className="badge badge-outline">
              via {SOURCE_LABELS[liveSource] || liveSource}
            </span>
          )}
          {(view === "search" || view === "top") && (
            <select
              className="select select-bordered select-sm"
              value={format}
              onChange={(e) => changeFormat(e.target.value)}
              aria-label="Format filter"
            >
              {formats.map((f) => (
                <option key={f} value={f}>
                  {f === "All" ? "All formats" : f}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-4xl text-center m-10">Loading…</p>
      ) : view === "recommendations" ? (
        recPairs.length > 0 ? (
          <div className="flex flex-col gap-6 my-8 mx-2">
            {recPairs.map((pair, i) => (
              <div
                key={`${pair.entry.malId}-${pair.recommended.malId}-${i}`}
                className="flex flex-wrap items-center gap-4 card bg-base-200 p-4"
              >
                <Link to={`/anime/${pair.entry.malId}`} className="font-bold text-lg">
                  {pair.entry.title}
                </Link>
                <span aria-hidden="true">→</span>
                <span className="opacity-70">if you liked that, try</span>
                <Link to={`/anime/${pair.recommended.malId}`} className="font-bold text-lg">
                  {pair.recommended.title}
                </Link>
                {pair.shared?.length > 0 && (
                  <span className="text-sm opacity-70">
                    (shared genres: {pair.shared.join(", ")})
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-4xl text-center m-10">No recommendations right now.</p>
        )
      ) : animeList.length > 0 ? (
        <>
          <div className="grid gap-14 my-10 mx-7 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {animeList.map((anime, i) => (
              <AnimeCard
                anime={anime}
                key={`${anime.malId ?? anime.kitsuId ?? anime.title}-${i}`}
                rank={view === "top" ? i + 1 : anime.rank}
              />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mb-16">
              <button
                type="button"
                className="btn btn-primary"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-4xl text-center m-10">
          {view === "search" ? "No anime matched your search." : "Nothing to show right now."}
        </p>
      )}
    </main>
  );
}
