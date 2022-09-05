import { Link } from "react-router-dom";
import { useContext } from "react";
import AnimeContext from "../context/AnimeContext";

export default function SidebarContent({ animeList }) {
  const {loading} = useContext(AnimeContext)

  return (
    <div className="flex flex-col mb-5">
      {loading ? (
        <p>Loading</p>
      ) : (
        <>
          {" "}
          {animeList.map((anime) => (
            <Link
              className="btn btn-md btn-primary rounded-none"
              to={`/anime/${anime.mal_id}`}
              key={anime.mal_id}
            >
              {anime.title}
            </Link>
          ))}
        </>
      )}
    </div>
  );
}
