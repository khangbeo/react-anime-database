import AnimeCard from "./AnimeCard";
import AnimeContext from "../context/AnimeContext";
import { useContext } from "react";

export default function MainContent() {

  const { animeList} = useContext(AnimeContext)
  return (
    <main className="mx-auto p-4 w-full">
      {animeList.length > 0 ? (
        <div className="grid gap-14 m-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {animeList.map((anime) => (
            <AnimeCard anime={anime} key={anime.mal_id} />
          ))}
        </div>
      ) : (
        <p className="text-6xl text-center m-6">Search Your Favorite Anime</p>
      )}
    </main>
  );
}
