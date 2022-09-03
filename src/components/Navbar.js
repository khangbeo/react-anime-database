import { Link } from "react-router-dom";
import { TiThMenu } from "react-icons/ti";
import SearchForm from "./SearchForm";

export default function Navbar() {
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
          <li>
            <Link to="#" className="btn btn-ghost">
              Navbar Item 1
            </Link>
          </li>
          <li>
            <Link to="#" className="btn btn-ghost">
              Navbar Item 2
            </Link>
          </li>
          <li>
            <SearchForm />
          </li>
        </ul>
      </div>
    </div>
  );
}
