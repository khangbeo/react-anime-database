import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AnimeContext from "../context/AnimeContext";
import { FaSearch } from "react-icons/fa";

export default function SearchForm() {
  const { runSearch, search, setSearch } = useContext(AnimeContext);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(search);
    navigate("/");
  };

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
        <button type="submit" className="btn btn-square outline-none" aria-label="Search">
          <FaSearch />
        </button>
      </div>
    </form>
  );
}
