
import { useState, useEffect } from 'react';
import MovieCard from '@/components/MovieCard';
import RecommendationEngine from '@/components/RecommendationEngine';
import OnboardingQuiz from '@/components/OnboardingQuiz';
import MovieHistory from '@/components/MovieHistory';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Movie, UserPreferences } from '@/types/movie';

const Index = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
  const [dislikedMovies, setDislikedMovies] = useState<Movie[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    genres: [],
    era: '',
    mood: '',
  });
  const [recommendationEngine] = useState(() => new RecommendationEngine());
  const [recommendations, setRecommendations] = useState<Movie[]>([]);

  // Initialize recommendations when user completes onboarding
  useEffect(() => {
    if (!showOnboarding && userPreferences.genres.length > 0) {
      const initialRecommendations = recommendationEngine.getInitialRecommendations(userPreferences);
      setRecommendations(initialRecommendations);
      
      toast({
        title: "Recommendations Ready!",
        description: "We've prepared some movies based on your preferences.",
      });
    }
  }, [showOnboarding, userPreferences, recommendationEngine, toast]);

  const handleSwipe = (liked: boolean) => {
    const currentMovie = recommendations[currentMovieIndex];
    
    if (liked) {
      setLikedMovies(prev => [...prev, currentMovie]);
      toast({
        title: "Added to favorites",
        description: `You liked "${currentMovie.title}"`,
      });
    } else {
      setDislikedMovies(prev => [...prev, currentMovie]);
    }

    // Update recommendations
    const updatedRecommendations = recommendationEngine.updateRecommendations(
      recommendations,
      currentMovie,
      liked,
      [...likedMovies, ...(liked ? [currentMovie] : [])],
      [...dislikedMovies, ...(!liked ? [currentMovie] : [])]
    );
    
    setRecommendations(updatedRecommendations);
    
    // Move to next movie
    const nextIndex = currentMovieIndex + 1;
    if (nextIndex < updatedRecommendations.length) {
      setCurrentMovieIndex(nextIndex);
    } else {
      // If we've gone through all recommendations, get more
      const newRecommendations = recommendationEngine.getMoreRecommendations(
        likedMovies, 
        dislikedMovies
      );
      setRecommendations(newRecommendations);
      setCurrentMovieIndex(0);
      
      toast({
        title: "New recommendations",
        description: "We've loaded more movies for you based on your preferences.",
      });
    }
  };

  const handleOnboardingComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    setShowOnboarding(false);
  };

  const resetRecommendations = () => {
    const resetRecommendations = recommendationEngine.getInitialRecommendations(userPreferences);
    setRecommendations(resetRecommendations);
    setCurrentMovieIndex(0);
    setLikedMovies([]);
    setDislikedMovies([]);
    
    toast({
      title: "Recommendations Reset",
      description: "We've refreshed your movie recommendations.",
    });
  };

  if (showOnboarding) {
    return <OnboardingQuiz onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          CinemaSwipe
        </h1>
        
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="history">My Movies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover" className="w-full flex flex-col items-center">
            {recommendations.length > 0 && (
              <div className="w-full max-w-md">
                <MovieCard 
                  movie={recommendations[currentMovieIndex]} 
                  onSwipe={handleSwipe} 
                  isMobile={isMobile}
                />
                
                <div className="flex justify-center gap-4 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSwipe(false)}
                    className="bg-red-500 hover:bg-red-600 text-white border-none px-8"
                  >
                    Dislike
                  </Button>
                  <Button 
                    onClick={() => handleSwipe(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-8"
                  >
                    Like
                  </Button>
                </div>

                <div className="mt-8 text-center">
                  <Button 
                    variant="outline" 
                    onClick={resetRecommendations}
                    className="bg-neutral-700 hover:bg-purple-700 text-white border-white/20 font-semibold px-6 py-2"
                  >
                    Reset Recommendations
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <MovieHistory likedMovies={likedMovies} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
