
import React, { useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Movie } from '@/types/movie';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

interface MovieHistoryProps {
  likedMovies: Movie[];
}

const MovieHistoryItem: React.FC<{ movie: Movie }> = ({ movie }) => {
  return (
    <Card className="h-full border-0 group">
      <div className="relative h-[300px] overflow-hidden rounded-t-lg">
        <img 
          src={movie.imageUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" 
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-xl font-bold text-white">{movie.title}</h3>
          <p className="text-sm text-white/70">{movie.year}</p>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {movie.genres.slice(0, 2).map((genre, i) => (
            <Badge key={i} variant="outline" className="bg-primary/10">
              {genre}
            </Badge>
          ))}
        </div>
        <p className="text-sm line-clamp-3 text-muted-foreground">
          {movie.description}
        </p>
      </CardContent>
    </Card>
  );
};

// Simplified 3D visualization component using basic Three.js elements
const Visualization3D: React.FC<{ likedMovies: Movie[] }> = ({ likedMovies }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const Cubes = () => {
    return (
      <>
        {likedMovies.map((movie, index) => {
          const x = Math.sin(index * (Math.PI * 2 / likedMovies.length)) * 5;
          const z = Math.cos(index * (Math.PI * 2 / likedMovies.length)) * 5;
          const y = Math.sin(index * 0.5) * 2;
          
          // Determine color based on primary genre
          const genre = movie.genres[0] || "";
          const genreColors: Record<string, string> = {
            "Action": "#e53e3e",
            "Comedy": "#38a169",
            "Drama": "#6b46c1", 
            "Horror": "#1a202c",
            "Sci-Fi": "#2b6cb0",
            "Romance": "#d53f8c",
            "Documentary": "#718096",
            "Thriller": "#dd6b20",
            "Animation": "#319795",
            "Fantasy": "#805ad5"
          };
          
          const color = genreColors[genre] || "#4a5568";
          
          return (
            <mesh key={index} position={[x, y, z]}>
              <boxGeometry args={[1.5, 2, 0.2]} />
              <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
            </mesh>
          );
        })}
      </>
    );
  };
  
  // Animate the entire scene
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <Canvas className="w-full h-[300px]">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <group ref={groupRef}>
        <Cubes />
      </group>
    </Canvas>
  );
};

const MovieHistory: React.FC<MovieHistoryProps> = ({ likedMovies }) => {
  const isMobile = useIsMobile();
  
  if (likedMovies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">No movies in your collection yet</h2>
        <p className="text-muted-foreground">
          Swipe right on movies you like to add them to your collection
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">Your Movie Collection</h2>
      
      {likedMovies.length >= 3 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Your Taste Visualization</h3>
          <Visualization3D likedMovies={likedMovies} />
        </div>
      )}
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-4">
          {likedMovies.map((movie) => (
            <CarouselItem key={movie.id} className={`pl-4 ${isMobile ? 'basis-full' : 'basis-1/3'}`}>
              <MovieHistoryItem movie={movie} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default MovieHistory;
