import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import AnimeContext from "../context/AnimeContext";
import SearchForm from "./SearchForm";

export default function Drawer({ children }) {
  const { navLinks, showTop, showSeason, showRecommendations, pickRandom } =
    useContext(AnimeContext);
  const navigate = useNavigate();

  const handleNav = async (link) => {
    if (link.view === "random") {
      const anime = await pickRandom();
      if (anime?.malId != null) navigate(`/anime/${anime.malId}`);
      return;
    }
    if (link.view === "top") showTop();
    else if (link.view === "season") showSeason();
    else if (link.view === "recommendations") showRecommendations();
    navigate("/");
  };

  const listItems = navLinks.map((link) => (
    <li key={link.id}>
      <button type="button" onClick={() => handleNav(link)}>
        {link.name}
      </button>
    </li>
  ));

  return (
    <nav>
      <div className="drawer drawer-end">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">{children}</div>

        <div className="drawer-side">
          <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
          <ul className="menu w-80 bg-base-100">
            <SearchForm />
            {listItems}
          </ul>
        </div>
      </div>
    </nav>
  );
}
