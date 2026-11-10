import { Link } from "react-router-dom";
import { useContext } from "react";
import AnimeContext from "../context/AnimeContext";

export default function SidebarContent({ animeList }) {
  const { sidebarLoading } = useContext(AnimeContext);

  if (sidebarLoading) {
    return <p className="text-center py-3 opacity-70">Loading…</p>;
  }

  if (!animeList || animeList.length === 0) {
    return <p className="text-center py-3 opacity-70">Couldn't load this list.</p>;
  }

  return (
    <ol className="flex flex-col mb-5">
      {animeList.map((anime, i) => (
        <li key={`${anime.malId}-${i}`}>
          <Link
            className="flex items-center gap-3 px-2 py-2 hover:bg-base-300 rounded"
            to={`/anime/${anime.malId}`}
          >
            <span className="font-bold w-6 text-center">{i + 1}</span>
            {anime.image && (
              <img
                src={anime.image}
                alt=""
                className="w-10 h-14 object-cover rounded"
                loading="lazy"
              />
            )}
            <span className="flex-1">
              <span className="block font-semibold leading-tight">{anime.title}</span>
              {anime.score != null && (
                <span className="block text-xs opacity-70">
                  ★ {Number(anime.score).toFixed(2)}
                  {anime.members != null &&
                    ` · ${Number(anime.members).toLocaleString()} members`}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
