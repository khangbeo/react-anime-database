import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function AnimeCardDetail() {
  let { id } = useParams();
  const url = process.env.REACT_APP_BASE_URL;

  const [fullAnime, setFullAnime] = useState([]);

  const getFullAnime = async () => {
    const fullQuery = `${url}/anime/${id}/full`;

    const res = await fetch(`${url}/${fullQuery}`);
    const fullAnimeData = await res.json();
    setFullAnime(fullAnimeData.data);
  };

  return (
    <>
      <div>
        {/* Image */}
        <div>
          {/* Name */}
          {/* Airing/Not Airing Badge */}
          {/* Score, Ranking, Popularity, Favorites */}
          <div>
            {/* external links */}
            {/* streaming */}
          </div>
          {/* Information
                    Type    
                    Rating
                    Episodes
                    Duration
                    Genre
                    Theme
                    Aired
                    Season
                    Studios
                    Licensor
                */}
        </div>
      </div>

      {/* Background div */}
      {/* synopsis div */}
      {/* Characters div */}
      <div>
        {/* character image, name, role: main/supporting */}
        {/* voice actors/actresses */}
      </div>
      {/* Reviews div */}
      <div>
        {/* Review card content */}
        <div>
          {/* Name, Rating, Date */}
          {/* Review body */}
          {/* Likes, Reviewer's Rating */}
        </div>
      </div>
    </>
  );
}
