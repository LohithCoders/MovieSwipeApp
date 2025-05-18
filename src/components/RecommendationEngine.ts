
import { Movie, UserPreferences } from '@/types/movie';
import { MOVIE_DATA } from '@/data/movies';

class RecommendationEngine {
  private movies: Movie[];

  constructor() {
    this.movies = [...MOVIE_DATA];
  }

  getInitialRecommendations(preferences: UserPreferences): Movie[] {
    // Apply initial filters based on user preferences
    let filteredMovies = this.movies;
    
    // Filter by genres
    if (preferences.genres.length > 0) {
      filteredMovies = filteredMovies.filter(movie => 
        movie.genres.some(genre => preferences.genres.includes(genre))
      );
    }
    
    // Filter by era
    if (preferences.era) {
      filteredMovies = filteredMovies.filter(movie => {
        const year = movie.year;
        switch (preferences.era) {
          case 'classic': return year < 1980;
          case 'modern': return year >= 1980 && year < 2010;
          case 'recent': return year >= 2010;
          default: return true;
        }
      });
    }
    
    // Filter by mood
    if (preferences.mood) {
      filteredMovies = filteredMovies.filter(movie => 
        movie.mood.includes(preferences.mood)
      );
    }
    
    // If we have too few results, relax the filters
    if (filteredMovies.length < 10) {
      filteredMovies = this.movies.filter(movie =>
        movie.genres.some(genre => preferences.genres.includes(genre))
      );
    }
    
    // If we still have too few, use all movies
    if (filteredMovies.length < 5) {
      filteredMovies = this.movies;
    }
    
    // Sort by rating and popularity to give better initial recommendations
    filteredMovies.sort((a, b) => 
      (b.rating * 0.7 + b.popularity * 0.3) - (a.rating * 0.7 + a.popularity * 0.3)
    );

    // Shuffle the top 20 to add some variety
    const topMovies = filteredMovies.slice(0, 20);
    const shuffledTop = this.shuffle(topMovies);
    
    // Return shuffled top movies + remaining sorted movies
    return [...shuffledTop, ...filteredMovies.slice(20)];
  }

  updateRecommendations(
    currentRecommendations: Movie[], 
    swipedMovie: Movie, 
    liked: boolean, 
    likedMovies: Movie[], 
    dislikedMovies: Movie[]
  ): Movie[] {
    // Don't re-recommend movies that have already been seen
    const seenMovieIds = [...likedMovies, ...dislikedMovies].map(movie => movie.id);
    let availableMovies = this.movies.filter(movie => !seenMovieIds.includes(movie.id));
    
    // Calculate similarity scores for all available movies
    const recommendationsWithScore = availableMovies.map(movie => {
      let score = 0;
      
      // Increase score based on similarity with liked movies
      for (const likedMovie of likedMovies) {
        score += this.calculateSimilarity(movie, likedMovie) * 1.5;
      }
      
      // Decrease score based on similarity with disliked movies
      for (const dislikedMovie of dislikedMovies) {
        score -= this.calculateSimilarity(movie, dislikedMovie);
      }
      
      // Add some randomness to avoid getting stuck in recommendation bubbles (exploration factor)
      score += (Math.random() * 0.2) - 0.1;
      
      return { movie, score };
    });
    
    // Sort by score (highest first)
    recommendationsWithScore.sort((a, b) => b.score - a.score);
    
    // Extract just the movies, now sorted by score
    const newRecommendations = recommendationsWithScore.map(item => item.movie);
    
    // Replace the current recommendations
    return newRecommendations;
  }

  getMoreRecommendations(likedMovies: Movie[], dislikedMovies: Movie[]): Movie[] {
    // Don't re-recommend movies that have already been seen
    const seenMovieIds = [...likedMovies, ...dislikedMovies].map(movie => movie.id);
    const availableMovies = this.movies.filter(movie => !seenMovieIds.includes(movie.id));

    if (likedMovies.length === 0) {
      // If user hasn't liked anything yet, return popular movies
      return this.shuffle(availableMovies.sort((a, b) => b.popularity - a.popularity).slice(0, 30));
    } else {
      // Use collaborative filtering approach
      return this.updateRecommendations([], {} as Movie, true, likedMovies, dislikedMovies);
    }
  }

  private calculateSimilarity(movie1: Movie, movie2: Movie): number {
    let similarity = 0;
    
    // Genre similarity (0-1)
    const commonGenres = movie1.genres.filter(genre => movie2.genres.includes(genre));
    const genreSimilarity = commonGenres.length / Math.max(1, Math.max(movie1.genres.length, movie2.genres.length));
    similarity += genreSimilarity * 0.4;
    
    // Era similarity (0-1)
    const yearDiff = Math.abs(movie1.year - movie2.year);
    const eraSimilarity = 1 - Math.min(1, yearDiff / 50);
    similarity += eraSimilarity * 0.2;
    
    // Mood similarity (0-1)
    const commonMoods = movie1.mood.filter(mood => movie2.mood.includes(mood));
    const moodSimilarity = commonMoods.length / Math.max(1, Math.max(movie1.mood.length, movie2.mood.length));
    similarity += moodSimilarity * 0.3;
    
    // Rating similarity (0-1)
    const ratingDiff = Math.abs(movie1.rating - movie2.rating);
    const ratingSimilarity = 1 - Math.min(1, ratingDiff / 10);
    similarity += ratingSimilarity * 0.1;
    
    return similarity;
  }

  private shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

export default RecommendationEngine;
