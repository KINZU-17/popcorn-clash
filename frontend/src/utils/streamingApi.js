const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const STREAMING_KEY = import.meta.env.VITE_STREAMING_API_KEY;
const STREAMING_HOST = import.meta.env.VITE_STREAMING_API_HOST;
const FOOTBALL_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
const FOOTBALL_BASE = 'https://api.football-data.org/v4';

// Empty fallback when API unavailable
const EMPTY_MOVIES = [];

// Map TMDb genre IDs to readable names
const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

function normalizeTmdbMovie(m) {
  const genreId = m.genre_ids?.[0];
  return {
    id: `tmdb-${m.id}`,
    tmdbId: m.id,
    title: m.title,
    overview: m.overview || 'No overview available.',
    posterUrl: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
    genre: GENRE_MAP[genreId] || 'Drama',
    year: m.release_date ? parseInt(m.release_date.slice(0, 4)) : null,
    rating: m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : null,
    duration: null, // TMDb search doesn't return runtime — fetched separately if needed
  };
}

// Fetch trending or search movies from TMDb
export async function fetchMovies({ query = '', genre = '', page = 1 } = {}) {
  if (!TMDB_KEY || TMDB_KEY === 'your_tmdb_api_key_here') return EMPTY_MOVIES;

  try {
    let url;
    if (query.trim()) {
      url = `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`;
    } else {
      url = `${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&page=${page}&language=en-US`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDb error ${res.status}`);
    const data = await res.json();
    let movies = (data.results || []).map(normalizeTmdbMovie);

    // Client-side genre filter (TMDb search doesn't support genre filter directly)
    if (genre && genre !== 'All Genres') {
      movies = movies.filter(m => m.genre === genre);
    }

    return movies.slice(0, 18);
  } catch (err) {
    console.error('TMDb fetch error:', err);
    return EMPTY_MOVIES;
  }
}

// Fetch movies by genre using TMDb discover endpoint
export async function fetchMoviesByGenre(genreName) {
  if (!TMDB_KEY || TMDB_KEY === 'your_tmdb_api_key_here') return EMPTY_MOVIES;

  const genreId = Object.entries(GENRE_MAP).find(([, name]) => name === genreName)?.[0];
  if (!genreId) return fetchMovies();

  try {
    const url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDb error ${res.status}`);
    const data = await res.json();
    return (data.results || []).map(normalizeTmdbMovie).slice(0, 18);
  } catch (err) {
    console.error('TMDb genre fetch error:', err);
    return EMPTY_MOVIES;
  }
}

// Fetch runtime for a single movie
export async function fetchMovieRuntime(tmdbId) {
  if (!TMDB_KEY || TMDB_KEY === 'your_tmdb_api_key_here') return null;
  try {
    const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.runtime) return null;
    const h = Math.floor(data.runtime / 60);
    const m = data.runtime % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  } catch {
    return null;
  }
}

// Fetch where a movie is streaming (by TMDb ID)
export async function fetchStreamingLinks(tmdbId, country = 'us') {
  if (!STREAMING_KEY || !tmdbId) return [];

  try {
    const url = `https://${STREAMING_HOST}/shows/search/filters?tmdb_id=movie/${tmdbId}&country=${country}&output_language=en`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': STREAMING_KEY,
        'X-RapidAPI-Host': STREAMING_HOST,
      },
    });
    if (!res.ok) throw new Error(`Streaming API error ${res.status}`);
    const data = await res.json();
    const options = data?.result?.streamingOptions?.[country] || [];
    return options.map(opt => ({
      service: opt.service?.name || opt.service,
      type: opt.type || 'subscription',
      link: opt.link,
      logo: opt.service?.imageSet?.lightThemeImage || null,
    }));
  } catch (err) {
    console.error('Streaming links error:', err);
    return [];
  }
}

// Legacy export — kept so MatchArena still works
export async function fetchMovieRecommendations(queryText = 'Drama') {
  return fetchMovies({ query: queryText });
}

// Fetch live soccer matches (using Premier League as default for free tier)
export async function fetchLiveMatches() {
  if (!FOOTBALL_KEY) return [];
  try {
    const res = await fetch(`${FOOTBALL_BASE}/competitions/PL/matches?status=LIVE`, {
      headers: { 'X-Auth-Token': FOOTBALL_KEY }
    });
    if (!res.ok) throw new Error(`Football API error ${res.status}`);
    const data = await res.json();
    return (data.matches || []).map(m => ({
      id: m.id,
      homeTeam: { name: m.homeTeam?.name || 'Home', code: m.homeTeam?.code || '', score: m.score?.fullTime?.home || 0 },
      awayTeam: { name: m.awayTeam?.name || 'Away', code: m.awayTeam?.code || '', score: m.score?.fullTime?.away || 0 },
      matchDate: m.utcDate ? new Date(m.utcDate).toLocaleTimeString() : 'LIVE',
      status: 'LIVE',
      league: m.competition?.name || 'Unknown',
      globalVotes: { home: 0, draw: 0, away: 0 }
    }));
  } catch (err) {
    console.error('Football fetch error:', err);
    return [];
  }
}

// Fetch upcoming soccer matches (using Premier League as default for free tier)
export async function fetchUpcomingMatches() {
  if (!FOOTBALL_KEY) return [];
  try {
    const res = await fetch(`${FOOTBALL_BASE}/competitions/PL/matches?status=SCHEDULED`, {
      headers: { 'X-Auth-Token': FOOTBALL_KEY }
    });
    if (!res.ok) throw new Error(`Football API error ${res.status}`);
    const data = await res.json();
    return (data.matches || []).map(m => ({
      id: m.id,
      homeTeam: { name: m.homeTeam?.name || 'Home', code: m.homeTeam?.code || '', score: 0 },
      awayTeam: { name: m.awayTeam?.name || 'Away', code: m.awayTeam?.code || '', score: 0 },
      matchDate: m.utcDate ? new Date(m.utcDate).toLocaleDateString() : 'Scheduled',
      status: 'SCHEDULED',
      league: m.competition?.name || 'Unknown',
      globalVotes: { home: 0, draw: 0, away: 0 }
    }));
  } catch (err) {
    console.error('Football fetch error:', err);
    return [];
  }
}