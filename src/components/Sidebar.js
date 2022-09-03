import { useContext } from "react";
import AnimeContext from "../context/AnimeContext";

export default function Sidebar() {
  const { topAnime } = useContext(AnimeContext);
  return (
    <div className="md:flex flex-col hidden w-72">
      <h3 className="text-3xl text-center font-bold mb-5">Top Anime</h3>
      <nav className="flex flex-col">
        {topAnime.map((anime) => (
          <a
            className="btn btn-md btn-primary rounded-3xl m-2"
            href={anime.url}
            target="_blank"
            rel="noreferrer"
            key={anime.mal_id}
          >
            {anime.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
