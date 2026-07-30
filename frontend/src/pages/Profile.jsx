import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameStateContext';
import { api } from '../utils/backendApi';
import {
  FireIcon,
  ClockIcon,
  FilmIcon,
  ChartPieIcon,
  ListBulletIcon,
  RectangleStackIcon,
  StarIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  LockClosedIcon,
  LanguageIcon,
  SparklesIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ProfileSection = ({ title, children }) => (
  <div className="profile-section shadow-card-glow">
    <h2 className="profile-section-title">{title}</h2>
    {children}
  </div>
);

const StatCard = ({ icon, label, value }) => (
  <div className="stat-card">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-3xl font-display font-black text-white mb-1">{value}</p>
    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono font-semibold">{label}</p>
  </div>
);

const Profile = ({ movies = [], collections = [], history = [] }) => {
  const { user } = useGame();
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newReview, setNewReview] = useState({ movieTitle: '', rating: 0, text: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedReviewText, setEditedReviewText] = useState('');
  const [editedReviewRating, setEditedReviewRating] = useState(0);
  const reviewIdCounter = useRef(0);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      setReviewsLoading(true);
      try {
        const fetchedReviews = await api.reviews.list();
        setReviews(fetchedReviews || []);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.movieTitle || newReview.rating === 0 || !newReview.text) {
      alert('Please select a movie, give a rating, and write a review.');
      return;
    }
    const movie = watchedMovies.find(m => m.title === newReview.movieTitle);
    const reviewData = { ...newReview, posterUrl: movie?.posterUrl };

    const tempId = `review-${++reviewIdCounter.current}`;
    setReviews([{ id: tempId, ...reviewData }, ...reviews]);
    setShowReviewForm(false);
    setNewReview({ movieTitle: '', rating: 0, text: '' });

    api.reviews.create(reviewData).then(savedReview => {
      setReviews(currentReviews =>
        currentReviews.map(r => (r.id === tempId ? savedReview : r))
      );
    }).catch(err => {
      console.error("Failed to save review:", err);
      setReviews(currentReviews => currentReviews.filter(r => r.id !== tempId));
      alert("Failed to save review. Please try again.");
    });
  };

  const handleDeleteReview = (id) => {
    const originalReviews = [...reviews];
    setReviews(reviews.filter(review => review.id !== id));
    api.reviews.delete(id).catch(err => {
      console.error("Failed to delete review:", err);
      setReviews(originalReviews);
      alert("Failed to delete review.");
    });
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review.id);
    setEditedReviewText(review.text);
    setEditedReviewRating(review.rating);
    setShowReviewForm(false);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
  };

  const handleSaveEdit = (id) => {
    const originalReviews = [...reviews];
    const updatedReviewData = { text: editedReviewText, rating: editedReviewRating };
    setReviews(reviews.map(r => r.id === id ? { ...r, ...updatedReviewData } : r));
    setEditingReviewId(null);
    api.reviews.update(id, updatedReviewData).catch(err => {
      console.error("Failed to update review:", err);
      setReviews(originalReviews);
      alert("Failed to update review.");
    });
  };

  const watchedCount = movies.filter(m => m.status === 'watched').length;
  const hoursWatched = Math.floor(watchedCount * 1.8);
  const genreCount = movies.reduce((acc, m) => {
    if (m.genre) acc[m.genre] = (acc[m.genre] || 0) + 1;
    return acc;
  }, {});
  const topGenres = Object.entries(genreCount).sort(([, a], [, b]) => b - a).slice(0, 3);

  const watchedMovies = movies.filter(m => m.status === 'watched');
  const watchlist = movies.filter(m => m.status === 'watchlist').slice(0, 5);
  const favorites = movies.filter(m => m.isFavorite).slice(0, 4);
  const recentHistory = history.slice(0, 5);

  if (!user) {
    return <div className="text-white text-center py-20 font-mono">Loading profile...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto text-white space-y-8 animate-fade-in">

      {/* 1. Profile Header Identity */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-8 glass-card rounded-3xl border border-white/[0.08] shadow-card-glow relative overflow-hidden">
        <div className="w-24 h-24 rounded-2xl gradient-accent flex items-center justify-center font-display font-black text-4xl text-white shadow-lg shrink-0">
          {(user.username || 'C').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">{user.username || 'Cinephile'}</h1>
          <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono font-bold text-primary-light">
              <SparklesIcon className="h-4 w-4" />
              <span>Level {user.level || '1 Cinephile'}</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-mono font-bold text-orange-400">
              <FireIcon className="h-4 w-4" />
              <span>{user.streak_count || 0} Day Streak</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Entertainment Metrics */}
      <ProfileSection title="Entertainment Metrics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<ClockIcon className="h-7 w-7 text-primary-light" />}
            label="Hours Watched"
            value={hoursWatched.toLocaleString()}
          />
          <StatCard
            icon={<FilmIcon className="h-7 w-7 text-secondary" />}
            label="Titles Logged"
            value={movies.length}
          />
          <StatCard
            icon={<ChartPieIcon className="h-7 w-7 text-accent-pink" />}
            label="Top Genre"
            value={topGenres[0]?.[0] || 'N/A'}
          />
        </div>
        {topGenres.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="section-label">Genre Breakdown</h3>
            <div className="space-y-3">
              {topGenres.map(([genre, count]) => (
                <div key={genre} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">{genre}</span>
                    <span className="text-white/40 font-mono">{count} films</span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                    <div
                      className="progress-gradient h-2 rounded-full"
                      style={{ width: `${(count / movies.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ProfileSection>

      {/* 3. Curation Hub */}
      <ProfileSection title="Curation Hub">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-2xl border border-white/[0.06]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><ListBulletIcon className="h-5 w-5 text-primary-light" />Watchlist Highlights</h3>
            <ul className="space-y-2.5">
              {watchlist.length > 0 ? watchlist.map(movie => (
                <li key={movie.id} className="text-xs text-white/80 font-medium truncate p-2 rounded-xl bg-white/[0.03] border border-white/[0.04]">{movie.title}</li>
              )) : <p className="text-xs text-white/30 font-mono">No movies in watchlist.</p>}
            </ul>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.06]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><RectangleStackIcon className="h-5 w-5 text-secondary" />Custom Collections</h3>
            <ul className="space-y-2.5">
              {collections.length > 0 ? collections.slice(0,3).map(col => (
                <li key={col.id} className="text-xs text-white/80 font-medium p-2 rounded-xl bg-white/[0.03] border border-white/[0.04] flex justify-between">
                  <span>{col.name}</span>
                  <span className="text-white/35 font-mono">{col.movieCount} films</span>
                </li>
              )) : <p className="text-xs text-white/30 font-mono">No custom collections yet.</p>}
            </ul>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="section-label">All-Time Favorites</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {favorites.length > 0 ? favorites.map(fav => (
              <div key={fav.id} className="movie-card">
                <div className="movie-card-poster">
                  <img src={fav.posterUrl} alt={fav.title} className="w-full h-full object-cover"/>
                  <div className="movie-card-gradient" />
                  <div className="card-info">
                    <h4 className="text-xs font-bold text-white truncate">{fav.title}</h4>
                  </div>
                </div>
              </div>
            )) : <p className="text-xs text-white/30 font-mono col-span-4">No favorites selected yet.</p>}
          </div>
        </div>
      </ProfileSection>

      {/* 4. Activity & Social Proof */}
      <ProfileSection title="Activity & Social Proof">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-2xl border border-white/[0.06]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><ClockIcon className="h-5 w-5 text-accent-gold" />Watch History</h3>
            <ul className="space-y-2.5">
              {recentHistory.length > 0 ? recentHistory.map(h => (
                <li key={h.id} className="text-xs text-white/80 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] flex justify-between items-center">
                  <span className="font-bold truncate">{h.title}</span>
                  <span className="text-white/35 font-mono text-[10px] shrink-0 ml-2">{h.watchedAt}</span>
                </li>
              )) : <p className="text-xs text-white/30 font-mono">No watch history yet.</p>}
            </ul>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/[0.06]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-accent-pink" />Recent Reviews</h3>
              <button onClick={() => { setShowReviewForm(!showReviewForm); setEditingReviewId(null); }} disabled={editingReviewId !== null} className="text-xs gradient-accent hover:opacity-90 text-white font-bold py-1.5 px-3 rounded-xl transition cursor-pointer disabled:opacity-40">
                {showReviewForm ? 'Cancel' : '+ Add Review'}
              </button>
            </div>

            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="glass-card p-4 rounded-2xl mb-4 space-y-3 border border-white/10">
                <select value={newReview.movieTitle} onChange={(e) => setNewReview({ ...newReview, movieTitle: e.target.value })} className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none">
                  <option value="" className="bg-bg-deepest text-white">Select a watched movie</option>
                  {watchedMovies.map(movie => ( <option key={movie.id} value={movie.title} className="bg-bg-deepest text-white">{movie.title}</option> ))}
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button type="button" key={star} onClick={() => setNewReview({ ...newReview, rating: star })}>
                        {newReview.rating >= star ? <StarIconSolid className="h-5 w-5 text-accent-gold" /> : <StarIcon className="h-5 w-5 text-white/20" />}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={newReview.text} onChange={(e) => setNewReview({ ...newReview, text: e.target.value })} placeholder="Write your review..." className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-xs text-white h-20 outline-none" />
                <button type="submit" className="w-full gradient-accent text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer">
                  Submit Review
                </button>
              </form>
            )}

            <div className="space-y-3">
              {reviewsLoading ? (
                <p className="text-xs text-white/30 font-mono">Loading reviews...</p>
              ) : reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="review-card">
                    {editingReviewId === review.id ? (
                      <div className="space-y-3">
                        <h4 className="font-bold text-white text-xs">{review.movieTitle}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button type="button" key={star} onClick={() => setEditedReviewRating(star)}>
                                {editedReviewRating >= star ? <StarIconSolid className="h-4 w-4 text-accent-gold" /> : <StarIcon className="h-4 w-4 text-white/20" />}
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea value={editedReviewText} onChange={(e) => setEditedReviewText(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2 text-xs text-white h-20 outline-none" />
                        <div className="flex justify-end gap-2">
                          <button onClick={handleCancelEdit} className="text-xs glass-card px-3 py-1 rounded-xl text-white/60">Cancel</button>
                          <button onClick={() => handleSaveEdit(review.id)} className="text-xs gradient-accent px-3 py-1 rounded-xl text-white font-bold">Save</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        {review.posterUrl && <img src={review.posterUrl} alt={review.movieTitle} className="w-10 rounded-lg object-cover" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-white text-xs truncate">{review.movieTitle}</h4>
                            <div className="flex">{[...Array(5)].map((_, i) => review.rating > i ? <StarIconSolid key={i} className="h-3.5 w-3.5 text-accent-gold" /> : <StarIcon key={i} className="h-3.5 w-3.5 text-white/20" />)}</div>
                          </div>
                          <p className="text-xs text-white/60 mt-1 leading-relaxed">{review.text}</p>
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => handleStartEdit(review)} disabled={editingReviewId !== null} className="p-1 text-white/30 hover:text-white transition-colors cursor-pointer">
                              <PencilIcon className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDeleteReview(review.id)} disabled={editingReviewId !== null} className="p-1 text-white/30 hover:text-red-400 transition-colors cursor-pointer">
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : ( <p className="text-xs text-white/30 font-mono">No reviews written yet.</p> )}
            </div>
          </div>
        </div>
      </ProfileSection>

      {/* 5. Preference & Streaming Settings */}
      <ProfileSection title="Settings">
        <div className="space-y-3">
          <div className="settings-row">
            <div className="flex items-center gap-3">
              <ArrowDownTrayIcon className="h-5 w-5 text-white/40"/>
              <span className="text-xs font-bold">Download Manager</span>
            </div>
            <button className="text-[11px] font-mono glass-card px-3 py-1.5 rounded-xl hover:bg-white/10 cursor-pointer">Manage</button>
          </div>
          <div className="settings-row">
            <div className="flex items-center gap-3">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-white/40"/>
              <span className="text-xs font-bold">Streaming Quality</span>
            </div>
            <button className="text-[11px] font-mono glass-card px-3 py-1.5 rounded-xl hover:bg-white/10 cursor-pointer">Auto (1080p)</button>
          </div>
          <div className="settings-row">
            <div className="flex items-center gap-3">
              <LanguageIcon className="h-5 w-5 text-white/40"/>
              <span className="text-xs font-bold">Subtitle & Audio Language</span>
            </div>
            <button className="text-[11px] font-mono glass-card px-3 py-1.5 rounded-xl hover:bg-white/10 cursor-pointer">English</button>
          </div>
          <div className="settings-row">
            <div className="flex items-center gap-3">
              <LockClosedIcon className="h-5 w-5 text-white/40"/>
              <span className="text-xs font-bold">Parental Controls</span>
            </div>
            <button className="text-[11px] font-mono glass-card px-3 py-1.5 rounded-xl hover:bg-white/10 cursor-pointer">Off</button>
          </div>
        </div>
      </ProfileSection>

    </div>
  );
};

export default Profile;
