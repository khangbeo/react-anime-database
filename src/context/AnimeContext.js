import { createContext, useEffect, useState } from "react";

const AnimeContext = createContext();

export function AnimeProvider({ children }) {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);

  /** Top Anime
   * maybe put these arrays into an object like this
   *
   * Edit: Nvm, it only want to render one category at a time instead of all of them
   * I went back to the old ugly way of storing state
   * {
   *    popular: [
   *        {
   *           stuff: string
   *        }, repeats for 4 more items
   *    ],
   *    airing: [],
   *    upcoming: []
   * }
   *
   */

  const [topPopular, setTopPopular] = useState([]);
  const [topAiring, setTopAiring] = useState([]);
  const [topUpcoming, setTopUpcoming] = useState([]);

  const [search, setSearch] = useState("");

  const url = process.env.REACT_APP_BASE_URL;

  const navLinks = [
    { id: 0, name: "Top Anime", href: "#" },
    { id: 1, name: "Seasonal Anime", href: "#" },
    { id: 2, name: "Promos", href: "#" },
    { id: 3, name: "Recommendations", href: "#" },
    { id: 4, name: "Random", href: "#" },
    { id: 5, name: "NSFW 18+", href: "#" },
  ];

  const getAnime = async () => {
    setLoading(true)
    const animeQuery = `anime?q=${search}&order_by=score&sort=asc`;

    const res = await fetch(`${url}/${animeQuery}`);
    const animeData = await res.json();
    setAnimeList(animeData.data);
    setLoading(false)
  };

  const getTopAnime = async (query) => {
    setLoading(true)
    const topQuery = `top/anime?filter=${query}`;
    const res = await fetch(`${url}/${topQuery}`);
    const topAnimeData = await res.json();
    const topFive = topAnimeData?.data.slice(0, 5);

    switch (query) {
      case "bypopularity":
        setTopPopular(topFive);
        break;
      case "airing":
        setTopAiring(topFive);
        break;
      case "upcoming":
        setTopUpcoming(topFive);
        break;
      default:
        return;
    }
    setLoading(false)
  };

  useEffect(() => {
    getTopAnime("bypopularity");
    getTopAnime("airing");
    getTopAnime("upcoming");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimeContext.Provider
      value={{
        loading,
        topPopular,
        topAiring,
        topUpcoming,
        animeList,
        search,
        setSearch,
        navLinks,
        getAnime,
      }}
    >
      {children}
    </AnimeContext.Provider>
  );
}
export default AnimeContext;
