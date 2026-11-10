import { Link } from "react-router-dom";

export default function AnimeCard({ anime, rank }) {
  if (!anime) return null;
  const displayRank = rank ?? anime.rank ?? null;
  return (
    <article className="mx-auto w-full md:w-56 lg:w-64">
      <Link
        to={`/anime/${anime.malId}`}
        className="relative mb-2 card ease-in-out duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer block"
      >
        <figure>
          {anime.image ? (
            <img
              className="object-cover h-full w-full md:h-96"
              src={anime.image}
              alt={anime.title}
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-64 md:h-96 bg-base-300 p-4 text-center font-bold">
              {anime.title}
            </div>
          )}
        </figure>
        {displayRank != null && (
          <span className="badge badge-primary absolute top-2 left-2">#{displayRank}</span>
        )}
        {anime.score != null && (
          <span className="badge badge-secondary absolute top-2 right-2">
            ★ {Number(anime.score).toFixed(2)}
          </span>
        )}
      </Link>
      <h3 className="text-lg font-bold text-neutral-content text-center">{anime.title}</h3>
      <p className="text-center text-sm opacity-70">
        {[anime.type, anime.year].filter(Boolean).join(" · ")}
      </p>
    </article>
  );
}
