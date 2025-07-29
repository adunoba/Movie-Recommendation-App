import React, { useState, useEffect } from 'react';

// Main App Component
export default function App() {
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [watchlist, setWatchlist] = useState([]);

    const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // Replace with your TMDB API key

    // Fetch popular movies on initial load
    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${'28168789472f458fc2ad3d81f94c0091'}&language=en-US&page=1`)
            .then(response => response.json())
            .then(data => setMovies(data.results))
            .catch(error => console.error('Error fetching popular movies:', error));
    }, []);

    // Search for movies
    const searchMovies = (query) => {
        if (!query) {
            // If search is cleared, show popular movies again
            fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${'28168789472f458fc2ad3d81f94c0091'}&language=en-US&page=1`)
                .then(response => response.json())
                .then(data => setMovies(data.results));
            return;
        }
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${'28168789472f458fc2ad3d81f94c0091'}&language=en-US&query=${query}&page=1&include_adult=false`)
            .then(response => response.json())
            .then(data => setMovies(data.results))
            .catch(error => console.error('Error searching movies:', error));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        searchMovies(e.target.value);
    };

    const handleMovieSelect = (movie) => {
        // Fetch more details for the selected movie
        fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${'28168789472f458fc2ad3d81f94c0091'}&language=en-US&append_to_response=credits,reviews`)
            .then(response => response.json())
            .then(data => setSelectedMovie(data))
            .catch(error => console.error('Error fetching movie details:', error));
    };

    const handleAddToFavorites = (movie) => {
        if (!favorites.find(fav => fav.id === movie.id)) {
            setFavorites([...favorites, movie]);
        }
    };

    const handleAddToWatchlist = (movie) => {
        if (!watchlist.find(item => item.id === movie.id)) {
            setWatchlist([...watchlist, movie]);
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <Header searchTerm={searchTerm} handleSearchChange={handleSearchChange} />

            <main className="container mx-auto px-4 py-8">
                {selectedMovie ? (
                    <MovieDetails movie={selectedMovie} setSelectedMovie={setSelectedMovie} />
                ) : (
                    <MovieList
                        movies={movies}
                        onMovieSelect={handleMovieSelect}
                        onAddToFavorites={handleAddToFavorites}
                        onAddToWatchlist={handleAddToWatchlist}
                    />
                )}
            </main>
        </div>
    );
}

// Header Component
function Header({ searchTerm, handleSearchChange }) {
    return (
        <header className="bg-gray-800 shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-red-600">MovieRecs</h1>
                <div className="w-1/2">
                    <input
                        type="text"
                        placeholder="Search for a movie..."
                        className="w-full bg-gray-700 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <nav>
                    <a href="#" className="text-gray-300 hover:text-white px-3">Login</a>
                    <a href="#" className="text-gray-300 hover:text-white px-3">Register</a>
                </nav>
            </div>
        </header>
    );
}

// MovieList Component
function MovieList({ movies, onMovieSelect, onAddToFavorites, onAddToWatchlist }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {movies && movies.map(movie => (
                <MovieCard
                    key={movie.id}
                    movie={movie}
                    onMovieSelect={onMovieSelect}
                    onAddToFavorites={onAddToFavorites}
                    onAddToWatchlist={onAddToWatchlist}
                />
            ))}
        </div>
    );
}

// MovieCard Component
function MovieCard({ movie, onMovieSelect, onAddToFavorites, onAddToWatchlist }) {
    const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/e2e8f0/e2e8f0?text=No+Image';

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <img
                src={posterUrl}
                alt={`${movie.title} poster`}
                className="w-full h-auto cursor-pointer"
                onClick={() => onMovieSelect(movie)}
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/500x750/e2e8f0/e2e8f0?text=No+Image'; }}
            />
            <div className="p-4">
                <h3 className="font-bold text-lg truncate">{movie.title}</h3>
                <p className="text-gray-400 text-sm">{new Date(movie.release_date).getFullYear()}</p>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-yellow-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        {movie.vote_average.toFixed(1)}
                    </span>
                    <div className="flex space-x-2">
                         <button onClick={() => onAddToFavorites(movie)} className="text-gray-400 hover:text-red-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </button>
                        <button onClick={() => onAddToWatchlist(movie)} className="text-gray-400 hover:text-blue-500">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// MovieDetails Component
function MovieDetails({ movie, setSelectedMovie }) {
    const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/e2e8f0/e2e8f0?text=No+Image';
    const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : '';

    return (
        <div className="relative">
             {backdropUrl && <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${backdropUrl})` }}></div>}
            <div className="relative container mx-auto p-8 bg-gray-900 bg-opacity-80 rounded-lg">
                <button onClick={() => setSelectedMovie(null)} className="absolute top-4 right-4 text-white text-3xl">&times;</button>
                <div className="flex flex-col md:flex-row">
                    <img src={posterUrl} alt={`${movie.title} poster`} className="w-full md:w-1/3 rounded-lg shadow-lg" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/500x750/e2e8f0/e2e8f0?text=No+Image'; }}/>
                    <div className="md:ml-8 mt-8 md:mt-0">
                        <h1 className="text-4xl font-bold">{movie.title}</h1>
                        <p className="text-gray-400 italic mt-2">{movie.tagline}</p>
                        <div className="flex items-center my-4">
                            <span className="text-yellow-400 flex items-center mr-4">
                               <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                {movie.vote_average.toFixed(1)}
                            </span>
                            <span className="text-gray-400">{movie.runtime} min</span>
                            <span className="mx-2 text-gray-500">|</span>
                            <span className="text-gray-400">{new Date(movie.release_date).getFullYear()}</span>
                        </div>
                        <div className="my-4">
                            {movie.genres.map(genre => (
                                <span key={genre.id} className="inline-block bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-300 mr-2 mb-2">{genre.name}</span>
                            ))}
                        </div>
                        <h2 className="text-2xl font-semibold mt-8 mb-2">Overview</h2>
                        <p className="text-gray-300">{movie.overview}</p>

                         <h2 className="text-2xl font-semibold mt-8 mb-2">Cast</h2>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {movie.credits && movie.credits.cast.slice(0, 8).map(actor => (
                                <div key={actor.cast_id} className="text-center">
                                    <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://placehold.co/185x278/e2e8f0/e2e8f0?text=No+Image'} alt={actor.name} className="rounded-lg mx-auto" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/185x278/e2e8f0/e2e8f0?text=No+Image'; }}/>
                                    <p className="font-semibold mt-2">{actor.name}</p>
                                    <p className="text-sm text-gray-400">{actor.character}</p>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
