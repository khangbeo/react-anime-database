import { Link } from "react-router-dom";
import { TiThMenu } from "react-icons/ti";
import { useContext } from "react";
import AnimeContext from "../context/AnimeContext";
import SearchForm from "./SearchForm";

export default function Navbar() {
  const { navLinks } = useContext(AnimeContext);

  const listItems = navLinks.map((link) => (
    <li key={link.id}>
      <Link to={link.href} className="btn btn-ghost">
        {link.name}
      </Link>
    </li>
  ));

  return (
    <div className="bg-primary sticky w-full navbar top-0 z-20 ease-in-out duration-300 text-primary-content">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Navbar Title
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
