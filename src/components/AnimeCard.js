import { Link } from "react-router-dom";
export default function AnimeCard({ anime }) {
  return (
    <>
      <article className="mx-auto w-full md:w-56 lg:w-64">
        <Link to={`/anime/${anime.mal_id}`} className="mb-2 card ease-in-out duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer">
          <figure>
            <img
              className="object-cover h-full w-full md:h-96"
              src={anime.images["jpg"]["large_image_url"]}
              alt="Anime Card"
            />
          </figure>
        </Link>
        <h3 className="text-lg font-bold text-neutral-content text-center">
          {anime.title}
        </h3>
      </article>
    </>
  );
}
