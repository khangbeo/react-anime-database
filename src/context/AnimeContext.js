import { createContext, useEffect, useState } from "react";

const AnimeContext = createContext();

export function AnimeProvider({ children }) {
  const [animeList, setAnimeList] = useState([]);
  const [topAnime, setTopAnime] = useState([]);
  const [search, setSearch] = useState("");

  const url = process.env.REACT_APP_BASE_URL;

  const handleSearch = async (e) => {
    e.preventDefault();
    getAnime();
  };

  const getAnime = async () => {
    const animeQuery = `anime?q=${search}&order_by=score&sort=asc`;

    const res = await fetch(`${url}/${animeQuery}`);
    const animeData = await res.json();
    setAnimeList(animeData.data);
  };

  const getTopAnime = async () => {
    const topQuery = `top/anime?filter=bypopularity`;
    const res = await fetch(`${url}/${topQuery}`);
    const topAnimeData = await res.json();

    setTopAnime(topAnimeData.data.slice(0, 10));
  };

  useEffect(() => {
    getTopAnime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimeContext.Provider
      value={{
        topAnime,
        animeList,
        search,
        setSearch,
        handleSearch,
      }}
    >
      {children}
    </AnimeContext.Provider>
  );
}
export default AnimeContext
