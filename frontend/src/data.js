export const INITIAL_MOVIES = [
  {
    id: 'm1',
    title: 'The Shawshank Redemption',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    genre: 'Drama',
    year: 1994,
    rating: 9.3,
    duration: '2h 22m',
    status: 'completed',
    progress: 100
  },
  {
    id: 'm2',
    title: 'Inception',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    genre: 'Sci-Fi',
    year: 2010,
    rating: 8.8,
    duration: '2h 28m',
    status: 'watching',
    progress: 45
  },
  {
    id: 'm3',
    title: 'The Dark Knight',
    overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    genre: 'Action',
    year: 2008,
    rating: 9.0,
    duration: '2h 32m',
    status: 'watchlist',
    progress: 0
  }
];

export const INITIAL_COLLECTIONS = [
  {
    id: 'c1',
    name: 'All-Time Favorites',
    movieCount: 3,
    updatedTime: '2 days ago',
    bgUrl: null,
    movieIds: ['m1', 'm2', 'm3']
  },
  {
    id: 'c2',
    name: 'Weekend Watchlist',
    movieCount: 2,
    updatedTime: '5 hours ago',
    bgUrl: null,
    movieIds: ['m2', 'm3']
  }
];

export const INITIAL_WATCHING_HISTORY = [
  {
    id: 'h1',
    title: 'Inception',
    watchedAt: '2 hours ago',
    progress: 45,
    posterUrl: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg'
  },
  {
    id: 'h2',
    title: 'The Dark Knight',
    watchedAt: 'Yesterday',
    progress: 100,
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
  }
];

export const INITIAL_TEAMS = [
  { rank: 1, name: 'Manchester City', code: 'MCI', league: 'Premier League', trend: 'up', rating: 892 },
  { rank: 2, name: 'Arsenal FC', code: 'ARS', league: 'Premier League', trend: 'up', rating: 881 },
  { rank: 3, name: 'Liverpool FC', code: 'LIV', league: 'Premier League', trend: 'down', rating: 875 },
  { rank: 4, name: 'Chelsea FC', code: 'CHE', league: 'Premier League', trend: 'up', rating: 860 },
  { rank: 5, name: 'Manchester United', code: 'MUN', league: 'Premier League', trend: 'down', rating: 845 }
];

export const INITIAL_FRIENDS = [
  { rank: 1, username: 'You', streak: 14, xp: 2450, accuracy: 78, favorite_club: 'Arsenal FC', isYou: true },
  { rank: 2, username: 'Tactician_Max', streak: 22, xp: 3890, accuracy: 82, favorite_club: 'Manchester City', isYou: false },
  { rank: 3, username: 'GoalHunter', streak: 9, xp: 1560, accuracy: 65, favorite_club: 'Liverpool FC', isYou: false },
  { rank: 4, username: 'PredictorPro', streak: 31, xp: 5200, accuracy: 88, favorite_club: 'Chelsea FC', isYou: false },
  { rank: 5, username: 'FootyFan99', streak: 5, xp: 890, accuracy: 54, favorite_club: 'Manchester United', isYou: false }
];

export const INITIAL_PREDICTORS = [
  { rank: 1, username: 'PredictorPro', streak: 31, correct: 142, total: 160, accuracy: 89, xp: 5200 },
  { rank: 2, username: 'Tactician_Max', streak: 22, correct: 118, total: 145, accuracy: 81, xp: 3890 },
  { rank: 3, username: 'You', streak: 14, correct: 67, total: 86, accuracy: 78, xp: 2450 },
  { rank: 4, username: 'GoalHunter', streak: 9, correct: 45, total: 69, accuracy: 65, xp: 1560 },
  { rank: 5, username: 'FootyFan99', streak: 5, correct: 22, total: 41, accuracy: 54, xp: 890 }
];
