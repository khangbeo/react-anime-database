import { Link } from "react-router-dom";
import { useContext } from "react";
import AnimeContext from "../context/AnimeContext";
import SearchForm from "./SearchForm";

export default function Drawer({ children }) {
  const { navLinks } = useContext(AnimeContext);

  const listItems = navLinks.map((link) => (
    <li key={link.id}>
      <Link to={link.href}>{link.name}</Link>
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
