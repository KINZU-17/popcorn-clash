INSERT OR IGNORE INTO users (username, email, password_hash, favorite_club) VALUES
    ('cinephile_king', 'king@popcornclash.app', '$2b$12$3lUvlKnU7DHFzdLroib9Bee2sJzPR9c5q4Ye6x3H.ct.TcGSEyUNi', 'Manchester United'),
    ('match_analyst', 'analyst@popcornclash.app', '$2b$12$XthaNo.WOu4hNyCDc9WEo.33ygw.AYkzo8RdK3w2RmT39vPo7MPE6', 'Liverpool'),
    ('popcorn_addict', 'addict@popcornclash.app', '$2b$12$nfJcycGcVKgzhCkpM8MyFusoT/p6F/mn5FDOxx7IuCjI0Ng5HETMO', 'Barcelona');

INSERT OR IGNORE INTO teams (name, code, league, stadium, rating_score) VALUES
    ('Manchester United', 'MUN', 'Premier League', 'Old Trafford', 85),
    ('Liverpool', 'LIV', 'Premier League', 'Anfield', 88),
    ('Barcelona', 'BAR', 'La Liga', 'Camp Nou', 87),
    ('Real Madrid', 'RMA', 'La Liga', 'Santiago Bernabéu', 90),
    ('Bayern Munich', 'BAY', 'Bundesliga', 'Allianz Arena', 89);

INSERT OR IGNORE INTO fixtures (team_home_id, team_away_id, match_date, status) VALUES
    (1, 2, '2026-08-15T20:00:00', 'SCHEDULED'),
    (3, 4, '2026-08-16T21:00:00', 'SCHEDULED'),
    (5, 1, '2026-08-17T19:30:00', 'SCHEDULED');

INSERT OR IGNORE INTO vote_predictions (user_id, fixture_id, predicted_winner_id, confidence_score) VALUES
    (1, 1, 2, 75),
    (2, 1, 1, 60),
    (3, 2, 4, 80);

INSERT OR IGNORE INTO movies (tmdb_id, title, overview, poster_url, genre, year, rating, duration) VALUES
    (278, 'The Shawshank Redemption', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'Drama', 1994, 9.3, '2h 22m'),
    (27205, 'Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', 'Sci-Fi', 2010, 8.8, '2h 28m'),
    (155, 'The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'Action', 2008, 9.0, '2h 32m'),
    (157336, 'Interstellar', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'Sci-Fi', 2014, 8.7, '2h 49m'),
    (238, 'The Godfather', 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son.', 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'Crime', 1972, 9.2, '2h 55m'),
    (424, 'Schindler''s List', 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.', 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg', 'Drama', 1993, 9.0, '3h 15m'),
    (550, 'Fight Club', 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much more.', 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'Drama', 1999, 8.8, '2h 19m'),
    (680, 'Pulp Fiction', 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 'Crime', 1994, 8.9, '2h 34m'),
    (496243, 'Parasite', 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', 'Thriller', 2019, 8.6, '2h 12m'),
    (122, 'The Lord of the Rings: The Return of the King', 'Gandalf and Aragorn lead the World of Men against Sauron''s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.', 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwSm56yMPm2prTWDr.jpg', 'Fantasy', 2003, 9.0, '3h 21m');

INSERT OR IGNORE INTO reviews (user_id, movie_title, rating, text, poster_url) VALUES
    (1, 'The Shawshank Redemption', 5, 'A masterpiece of hope and perseverance.', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'),
    (1, 'Inception', 4, 'Mind-bending and visually stunning.', 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg'),
    (1, 'The Dark Knight', 5, 'Heath Ledger''s Joker is legendary.', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'),
    (2, 'Interstellar', 5, 'Christopher Nolan at his finest.', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'),
    (3, 'Pulp Fiction', 5, 'Quentin Tarantino''s masterpiece.', 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg');
