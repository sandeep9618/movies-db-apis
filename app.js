let express = require("express");
let path = require("path");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");

let app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "moviesData.db");

let db = null;

let initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running");
    });
  } catch (e) {
    process.exit(1);
  }
};

initializeDBAndServer();
//get all movies
let convertingSCtoCS = (eachMovie) => {
  return {
    movieName: eachMovie.movie_name,
  };
};

let convertingSCtoCSTotalMovArray = (eachMovie) => {
  return {
    movieId: eachMovie.movie_id,
    directorId: eachMovie.director_id,
    movieName: eachMovie.movie_name,
    leadActor: eachMovie.lead_actor,
  };
};

let convertingSCtoCSTotalDirArray = (eachDirector) => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getAllMovies = `
    SELECT * FROM movie ORDER BY movie_id;`;
  const moviesArray = await db.all(getAllMovies);
  response.send(moviesArray.map((eachMovie) => convertingSCtoCS(eachMovie)));
});

app.post("/movies/", async (request, response) => {
  let movieDetails = request.body;
  let { movieName, directorId, leadActor } = movieDetails;
  let insertNewMovieDetails = `INSERT INTO movie(movie_name,director_id,lead_actor) 
  VALUES('${movieName}', ${directorId}, '${leadActor}');`;
  const dbResponse = await db.run(insertNewMovieDetails);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  const getAllMovies = `
    SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const moviesArray = await db.get(getAllMovies);
  response.send(convertingSCtoCSTotalMovArray(moviesArray));
});

app.put("/movies/:movieId/", async (request, response) => {
  try {
    let movieDetails = request.body;
    let { directorId, movieName, leadActor } = movieDetails;
    let { movieId } = request.params;
    let updating = `UPDATE movie SET 
  movie_name = '${movieName}' ,
  lead_actor = '${leadActor}',
  director_id =${directorId}
  WHERE movie_id = ${movieId};`;
    const dbResponse = await db.run(updating);
    response.send("Movie Details Updated");
  } catch (e) {
    console.log(e.message);
  }
});

app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM movie WHERE movie_id = ${movieId}`;
  const moviesArray = await db.run(deleteMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getAllDirectors = `
    SELECT * FROM director ;`;
  const directorsArray = await db.all(getAllDirectors);
  response.send(
    directorsArray.map((eachDirector) =>
      convertingSCtoCSTotalDirArray(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  const getAllMovies = `
    SELECT * FROM movie WHERE director_id = ${directorId};`;
  const moviesArray = await db.all(getAllMovies);
  response.send(moviesArray.map((eachMovie) => convertingSCtoCS(eachMovie)));
});

module.exports = app;
