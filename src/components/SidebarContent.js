import React from "react";

export default function SidebarContent({ animeList }) {
  return (
    <div className="flex flex-col mb-5">
      {animeList.map((anime) => (
        <a
          className="btn btn-md btn-primary rounded-none"
          href={anime.url}
          target="_blank"
          rel="noreferrer"
          key={anime.mal_id}
        >
          {anime.title}
        </a>
      ))}
    </div>
  );
}
