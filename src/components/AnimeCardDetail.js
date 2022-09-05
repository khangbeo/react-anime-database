import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function isNull(value) {
  return typeof value === "object" && !value;
}

function combineArrayElements(array) {
  return array?.map((val) => val.name).join(", ");
}

// function capitalize(word) {
//   return [...word[0].toUpperCase(), ...word.slice(1)].join("");
// }

const Badge = ({ airing, status }) => {
  return (
    <span
      className={`badge badge-${
        airing ? "success" : "error"
      } badge-lg m-3 text-lg md:text-2xl h-7 md:h-9`}
    >
      <p>{status}</p>
    </span>
  );
};

const TableRow = ({ heading, data }) => {
  return (
    <tr>
      {heading && <th>{heading}</th>}
      <td>{data}</td>
    </tr>
  );
};

export default function AnimeCardDetail() {
  let { id } = useParams();
  const url = process.env.REACT_APP_BASE_URL;

  const [fullAnime, setFullAnime] = useState([]);
  const [characters, setCharacters] = useState([]);

  console.log(characters);
  const getFullAnime = async () => {
    const fullQuery = `anime/${id}/full`;
    const res = await fetch(`${url}/${fullQuery}`);
    const fullAnimeData = await res.json();
    setFullAnime(fullAnimeData.data);
  };

  const getAnimeCharacters = async () => {
    const query = `anime/${id}/characters`;
    const res = await fetch(`${url}/${query}`);
    const data = await res.json();
    setCharacters(data.data);
  };

  useEffect(() => {
    getFullAnime();
  }, [id]);

  useEffect(() => {
    getAnimeCharacters();
  }, [id]);

  return (
    <>
      <div>
        {/* Image */}
        <img
          className="pt-5 h-full w-full"
          src={fullAnime?.images?.jpg?.large_image_url}
          alt="anime detail"
        />
        <div className="mt-3">
          <div className="flex flex-wrap items-center justify-center">
            {/* Name */}
            <h2 className="text-3xl md:text-5xl font-bold">
              {fullAnime?.title}
            </h2>
            {/* Airing/Not Airing Badge */}
            <Badge airing={fullAnime?.airing} status={fullAnime?.status} />
          </div>

          {/* Score, Ranking, Popularity, Favorites */}
          <div className="grid grid-cols-4 text-center text-md md:text-2xl my-5 p-2 card bg-base-300 text-base-content">
            <div>
              <h3 className="font-bold">Score</h3>
              <p>{isNull(fullAnime?.score) ? 0 : fullAnime?.score}</p>
            </div>
            <div>
              <h3 className="font-bold">Rank</h3>
              <p>#{isNull(fullAnime?.rank) ? 0 : fullAnime?.rank}</p>
            </div>
            <div>
              <h3 className="font-bold">Popularity</h3>
              <p>#{isNull(fullAnime?.popularity) ? 0 : fullAnime?.popularity}</p>
            </div>
            <div>
              <h3 className="font-bold">Favorites</h3>
              <p>{isNull(fullAnime?.favorites) ? 0 : fullAnime?.favorites}</p>
            </div>
          </div>

          {/* streaming */}
          {fullAnime?.streaming?.length > 0 && (
            <div className="my-5">
              <h3 className="text-center text-2xl font-bold mb-2">
                Where to Stream
              </h3>
              <div className="flex justify-center flex-wrap">
                {fullAnime?.streaming?.map((stream) => (
                  <a
                    className="btn btn-xs btn-info m-1"
                    key={stream?.name}
                    href={stream?.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {stream?.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="my-5">
            {/* external links */}
            <h3 className="text-center text-2xl font-bold mb-2">
              External Links
            </h3>
            <div className="flex justify-center flex-wrap">
              {fullAnime?.external?.map((link) => (
                <a
                  className="btn btn-xs btn-info m-1"
                  key={link?.name}
                  href={link?.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link?.name}
                </a>
              ))}
            </div>
          </div>
          {/* Information
                    Type    
                    Episodes
                    Duration
                    Genre
                    Theme
                    Aired
                    Season
                    Studios
                    Licensor
                */}
          <table className="table-fixed text-left border-separate border-spacing-5 w-full ">
            <TableRow heading={"Type"} data={fullAnime.type} />
            <TableRow
              heading={"Genre"}
              data={combineArrayElements(fullAnime.genres)}
            />
            <TableRow
              heading={"Themes"}
              data={combineArrayElements(fullAnime.themes)}
            />
            <TableRow heading={"Aired"} data={fullAnime.aired?.string} />
            <TableRow heading={"Episodes"} data={fullAnime.episodes} />
            <TableRow heading={"Duration"} data={fullAnime.duration} />
            <TableRow heading={"Season"} data={fullAnime.season} />
            <TableRow
              heading={"Studios"}
              data={combineArrayElements(fullAnime.studios)}
            />
            <TableRow
              heading={"Licensor"}
              data={combineArrayElements(fullAnime.licensors)}
            />
          </table>
        </div>
      </div>

      {/* Background div */}
      {fullAnime.background && (
        <div className="card w-full bg-base-300 shadow-xl my-5">
          <div className="card-body">
            <h3 className="card-title">Background</h3>
            <p>{fullAnime.background}</p>
          </div>
        </div>
      )}
      {/* synopsis div */}

      <div className="card w-full bg-base-300 shadow-xl my-5 h-72">
        <h3 className="card-title px-5 py-3">Synopsis</h3>
        <div className="card-body overflow-y-auto">
          <p>{fullAnime.synopsis}</p>
        </div>
      </div>

      {/* Characters div 
      
              /* character: {
              images: {
                jpg: image_url
              },
              name, 
              url,
            }, 
            favorites,
            role 
      */}

      <div className="card w-full bg-base-300 shadow-xl my-5">
        <h3 className="card-title px-5 py-3">Characters</h3>
        <div className="h-96 overflow-y-auto">
          <table className="table-fixed text-left border-separate border-spacing-5">
            <thead>
              <th>Name</th>
              <th>Role</th>
            </thead>
            {characters?.map((e) => (
              <>
                <tbody>
                  <tr>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img
                              src={e.character.images.jpg.image_url}
                              alt="Character"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{e.character.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{e.role}</td>
                  </tr>
                </tbody>
              </>
            ))}
          </table>
        </div>
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
