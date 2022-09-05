import { useContext } from "react";
import AnimeContext from "../context/AnimeContext";
import SidebarContent from "./SidebarContent";
export default function Sidebar() {
  const { topPopular, topAiring, topUpcoming } = useContext(AnimeContext);

  return (
    <aside className="md:flex flex-col hidden w-72 pt-5 overflow-y-auto">
      <h3 className="text-xl text-center font-bold">Top Airing Anime</h3>
      <SidebarContent animeList={topAiring} />

      <h3 className="text-xl text-center font-bold">Top Upcoming Anime</h3>
      <SidebarContent animeList={topUpcoming} />

      <h3 className="text-xl text-center font-bold">Most Popular Anime</h3>
      <SidebarContent animeList={topPopular} />
    </aside>
  );
}
