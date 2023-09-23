import React, { useState, useEffect } from "react";
import { read, utils } from "xlsx"; // Import XLSX
import "./MovieList.css"; // CSS for styling

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [genreFilter, setGenreFilter] = useState("");
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const filePath = "/assets/movies.xlsx"; // Adjust the path to your Excel file
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();

        const data = new Uint8Array(arrayBuffer);
        const workbook = read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const movieData = utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Extract unique genres from movie data
        const uniqueGenres = [
          ...new Set(
            movieData.flatMap((movie) =>
              movie.Genre?.split(",").map((g) => g.trim().toLowerCase())
            )
          ),
        ];

        setGenres(uniqueGenres.sort());
        setMovies(movieData);
      } catch (error) {
        console.error("Error reading the Excel file:", error);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = genreFilter
    ? movies.filter((movie) =>
        movie.Genre?.toLowerCase().includes(genreFilter.toLowerCase())
      )
    : movies;

  const movieCount = filteredMovies.length;
  const prevIndex = (currentIndex - 1 + movieCount) % movieCount;
  const nextIndex = (currentIndex + 1) % movieCount;
  const currentMovie = filteredMovies[currentIndex];
  const prevMovie = filteredMovies[prevIndex];
  const nextMovie = filteredMovies[nextIndex];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movieCount);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + movieCount) % movieCount);
  };

  const handleRandom = () => {
    setCurrentIndex(Math.floor(Math.random() * movieCount));
  };

  const handleGenreChange = (event) => {
    setGenreFilter(event.target.value);
  };

  const convertExcelDateToJSDate = (excelDate) => {
    const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
    return jsDate.toDateString();
  };

  const excludedFields = ["Pre-sorted", "Title", "Poster", "Type"];

  return (
    <div className="movie-list">
      <div className="sidebar">
        <h2>Select Genre</h2>
        <select value={genreFilter} onChange={handleGenreChange}>
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre?.charAt(0).toUpperCase() + genre?.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="movie-card">
        {currentMovie && (
          <>
            <div className="carousel">
              <div className="carousel-item">
                {prevMovie && (
                  <img
                    src={prevMovie["Poster"]}
                    alt={prevMovie["Title"]}
                    className="carousel-image prev"
                  />
                )}
              </div>
              <div className="carousel-item">
                {currentMovie && (
                  <img
                    src={currentMovie["Poster"]}
                    alt={currentMovie["Title"]}
                    className="carousel-image current"
                  />
                )}
              </div>
              <div className="carousel-item">
                {nextMovie && (
                  <img
                    src={nextMovie["Poster"]}
                    alt={nextMovie["Title"]}
                    className="carousel-image next"
                  />
                )}
              </div>
            </div>
            <div className="movie-details">
              <h2>{currentMovie["Title"]}</h2>
              <p>
                {Object.entries(currentMovie)
                  .filter(([key]) => !excludedFields.includes(key))
                  .map(([key, value]) => (
                    <li className="movie-details-item" key={key}>
                      {key === "Released" ? (
                        <span className="movie-details-label">{key}:</span>
                      ) : (
                        <span className="movie-details-label">{key}:</span>
                      )}
                      {key === "Released" ? (
                        <span>
                          {convertExcelDateToJSDate(currentMovie["Released"])}
                        </span>
                      ) : (
                        <span>{value}</span>
                      )}
                    </li>
                  ))}
              </p>
            </div>
          </>
        )}
        <div className="controls">
          <button onClick={handlePrev}>Previous</button>
          <button onClick={handleRandom}>Random</button>
          <button onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default MovieList;
