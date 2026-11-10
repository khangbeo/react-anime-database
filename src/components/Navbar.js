import { Link, useNavigate } from "react-router-dom";
import { TiThMenu } from "react-icons/ti";
import { useContext } from "react";
import AnimeContext from "../context/AnimeContext";
import SearchForm from "./SearchForm";

export default function Navbar() {
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
      <button type="button" onClick={() => handleNav(link)} className="btn btn-ghost">
        {link.name}
      </button>
    </li>
  ));

  return (
    <div className="bg-primary sticky w-full h-10 navbar top-0 z-20 ease-in-out duration-300 text-primary-content">
      <div className="flex-1">
        <Link to="/" onClick={showTop} className="btn btn-ghost normal-case text-xl">
          Anime Database
        </Link>
      </div>
      <div className="flex-none lg:hidden">
        <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
          <TiThMenu size={30} />
        </label>
      </div>
      <div className="flex-none hidden lg:block">
        <ul className="flex items-center">
          {listItems}
          <li>
            <SearchForm />
          </li>
        </ul>
      </div>
    </div>
  );
}
