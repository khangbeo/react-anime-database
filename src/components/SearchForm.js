import { useContext } from "react";
import AnimeContext from "../context/AnimeContext";
import { FaSearch } from "react-icons/fa";

export default function SearchForm() {
  const { handleSearch, search, setSearch } = useContext(AnimeContext);

  return (
    <form className="form-control m-5" onSubmit={handleSearch}>
      <div className="input-group">
        <input
          type="search"
          placeholder="Search for an anime..."
          required
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full text-primary-content bg-base-content focus:outline-none"
        />
        <button type="submit" className="btn btn-square outline-none">
          <FaSearch />
        </button>
      </div>
    </form>
  );
}
