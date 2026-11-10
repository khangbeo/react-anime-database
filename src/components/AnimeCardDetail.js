import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import AnimeContext from "../context/AnimeContext";
import { getAnimeDetail } from "../api/animeApi";

const Badge = ({ airing, status }) => {
  if (!status) return null;
  return (
    <span
      className={`badge badge-${airing ? "success" : "error"} badge-lg m-3 text-lg md:text-2xl h-7 md:h-9`}
    >
      <p>{status}</p>
    </span>
  );
};

const TableRow = ({ heading, data }) => {
  if (data == null || data === "") return null;
  return (
    <tr>
      {heading && <th>{heading}</th>}
      <td>{data}</td>
    </tr>
  );
};

function fmtDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toDateString();
}

function Stat({ label, value }) {
  return (
    <div>
      <h3 className="font-bold">{label}</h3>
      <p>{value ?? "—"}</p>
    </div>
  );
}

export default function AnimeCardDetail() {
  const { id } = useParams();
  const { snapshotMode } = useContext(AnimeContext);
  const [anime, setAnime] = useState(null);
  const [source, setSource] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAnime(null);
    setError(false);
    (async () => {
      try {
        const result = await getAnimeDetail(id);
        if (cancelled) return;
        setAnime(result.data);
        setSource(result.source);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="text-center my-16">
        <p className="text-4xl font-bold mb-4">Couldn't load this anime.</p>
        <p className="opacity-70 mb-6">
          None of the data sources could reach it right now.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Top Anime
        </Link>
      </div>
    );
  }

  if (!anime) {
    return <p className="text-4xl text-center m-10">Loading…</p>;
  }

  const externalLinks = [
    anime.malId && {
      name: "MyAnimeList",
      url: `https://myanimelist.net/anime/${anime.malId}`,
    },
    anime.anilistId && {
      name: "AniList",
      url: `https://anilist.co/anime/${anime.anilistId}`,
    },
    anime.kitsuId && {
      name: "Kitsu",
      url: `https://kitsu.io/anime/${anime.kitsuId}`,
    },
  ].filter(Boolean);

  const aired =
    fmtDate(anime.airedFrom) &&
    `${fmtDate(anime.airedFrom)}${anime.airedTo ? ` to ${fmtDate(anime.airedTo)}` : ""}`;

  const inSnapshot = snapshotMode || source === "snapshot";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      {inSnapshot && (
        <div className="alert alert-warning shadow-lg my-4">
          <span>
            Live data couldn't be reached, so you're seeing a snapshot of top and
            seasonal titles saved on Nov 10, 2026.
          </span>
        </div>
      )}

      {anime.banner && (
        <img className="w-full max-h-72 object-cover" src={anime.banner} alt="" />
      )}

      <div className="flex flex-col md:flex-row gap-6 mt-5">
        {anime.image && (
          <img
            className="w-64 mx-auto md:mx-0 object-cover rounded"
            src={anime.image}
            alt={anime.title}
          />
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start">
            <h2 className="text-3xl md:text-5xl font-bold">{anime.title}</h2>
            <Badge airing={anime.airing} status={anime.status} />
          </div>
          {anime.romaji && anime.romaji !== anime.title && (
            <p className="text-center md:text-left opacity-70 mt-1">{anime.romaji}</p>
          )}

          <div className="grid grid-cols-4 text-center text-md md:text-2xl my-5 p-2 card bg-base-300 text-base-content">
            <Stat label="Score" value={anime.score != null ? Number(anime.score).toFixed(2) : null} />
            <Stat label="Rank" value={anime.rank != null ? `#${anime.rank}` : null} />
            <Stat label="Popularity" value={anime.popularity != null ? `#${anime.popularity}` : null} />
            <Stat
              label={anime.members != null ? "Members" : "Favorites"}
              value={
                anime.members != null
                  ? Number(anime.members).toLocaleString()
                  : anime.favorites != null
                    ? Number(anime.favorites).toLocaleString()
                    : null
              }
            />
          </div>

          {anime.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 my-3 justify-center md:justify-start">
              {anime.genres.map((g) => (
                <span key={g} className="badge badge-outline">
                  {g}
                </span>
              ))}
            </div>
          )}

          {anime.trailerUrl && (
            <div className="my-4 text-center md:text-left">
              <a
                className="btn btn-secondary"
                href={anime.trailerUrl}
                target="_blank"
                rel="noreferrer"
              >
                Watch Trailer
              </a>
            </div>
          )}

          {externalLinks.length > 0 && (
            <div className="my-4">
              <h3 className="text-center md:text-left text-xl font-bold mb-2">External Links</h3>
              <div className="flex justify-center md:justify-start flex-wrap">
                {externalLinks.map((link) => (
                  <a
                    className="btn btn-xs btn-info m-1"
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <table className="table-fixed text-left border-separate border-spacing-5 w-full">
        <tbody>
          <TableRow heading="Type" data={anime.type} />
          <TableRow heading="Genres" data={anime.genres?.join(", ")} />
          <TableRow heading="Aired" data={aired} />
          <TableRow heading="Episodes" data={anime.episodes} />
          <TableRow
            heading="Duration"
            data={anime.episodeLength ? `${anime.episodeLength} min per episode` : null}
          />
          <TableRow
            heading="Season"
            data={
              anime.season || anime.year
                ? `${anime.season ? anime.season[0].toUpperCase() + anime.season.slice(1) : ""} ${anime.year ?? ""}`.trim()
                : null
            }
          />
          <TableRow heading="Studios" data={anime.studios?.join(", ")} />
          <TableRow heading="Producers" data={anime.producers?.join(", ")} />
          <TableRow heading="Rating" data={anime.rating} />
        </tbody>
      </table>

      {anime.synopsis && (
        <div className="card w-full bg-base-300 shadow-xl my-5">
          <h3 className="card-title px-5 py-3">Synopsis</h3>
          <div className="card-body">
            <p>{anime.synopsis}</p>
          </div>
        </div>
      )}

      {anime.characters?.length > 0 && (
        <div className="card w-full bg-base-300 shadow-xl my-5">
          <h3 className="card-title px-5 py-3">Characters</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
            {anime.characters.map((c, i) => (
              <div key={`${c.name}-${i}`} className="flex items-center gap-3">
                {c.image && (
                  <img src={c.image} alt={c.name} className="w-12 h-12 object-cover rounded-full" />
                )}
                <div>
                  <p className="font-bold leading-tight">{c.name}</p>
                  <p className="text-xs opacity-70">
                    {c.role}
                    {c.voiceActor && ` · VA: ${c.voiceActor}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {anime.relations?.length > 0 && (
        <div className="my-8">
          <h3 className="text-2xl font-bold mb-4 text-center">More Like This</h3>
          <div className="grid gap-8 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {anime.relations
              .filter((r) => r.malId != null)
              .map((r, i) => (
                <Link key={`${r.malId}-${i}`} to={`/anime/${r.malId}`} className="text-center">
                  {r.image && (
                    <img src={r.image} alt={r.title} className="w-full h-48 object-cover rounded" />
                  )}
                  <p className="font-semibold mt-2 leading-tight">{r.title}</p>
                  <p className="text-xs opacity-70">{r.relationType?.replace(/_/g, " ")}</p>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
