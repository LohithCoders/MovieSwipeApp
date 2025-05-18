
import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Movie } from "@/types/movie";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

interface MovieCardProps {
  movie: Movie;
  onSwipe: (liked: boolean) => void;
  isMobile: boolean;
}

// Simple 3D model component
const FallbackModel = ({ color = 'red' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 2, 0.2]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
    </mesh>
  );
};

const MovieCard: React.FC<MovieCardProps> = ({ movie, onSwipe, isMobile }) => {
  const [flipped, setFlipped] = useState(false);
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0, 1, 1, 1, 0]);
  
  // Background color based on movie's primary genre
  const getBgColor = () => {
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
    
    return genreColors[genre] || "#4a5568";
  };

  // Handle drag end
  const handleDragEnd = () => {
    const xValue = x.get();
    if (Math.abs(xValue) > 100) {
      setExitX(xValue > 0 ? 500 : -500);
      onSwipe(xValue > 0);
    }
  };

  // Reset exitX when movie changes
  useEffect(() => {
    setExitX(0);
    setFlipped(false);
  }, [movie]);

  return (
    <motion.div 
      className="relative w-full"
      style={{ x, rotate, opacity }}
      drag={!flipped ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`cursor-pointer h-[600px] overflow-hidden transition-all duration-500 perspective-1000 shadow-xl`}
        style={{ 
          backgroundImage: !flipped ? `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${movie.imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: flipped ? getBgColor() : undefined,
          borderRadius: '1.5rem',
          boxShadow: flipped ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' : '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
        onClick={() => setFlipped(!flipped)}
      >
        {!flipped ? (
          <CardContent className="flex flex-col justify-between h-full p-8 glass-effect">
            <div className="flex justify-between items-start">
              <Badge variant="secondary" className="bg-white/30 backdrop-blur-lg text-white font-bold px-3 py-1">
                {movie.year}
              </Badge>
              <Badge variant="secondary" className="bg-white/30 backdrop-blur-lg text-white font-bold px-3 py-1">
                {movie.rating}/10
              </Badge>
            </div>
            
            <div className="mt-auto">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">{movie.title}</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {movie.genres.slice(0, 3).map((genre, index) => (
                  <Badge key={index} variant="outline" className="bg-white/20 backdrop-blur-lg text-white border-white/20 px-3 py-1">
                    {genre}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-sm text-white opacity-90 line-clamp-2 leading-relaxed">
                {movie.description}
              </p>
            </div>
            
            <div className="text-center mt-6 text-white opacity-80 font-medium">
              <span className="inline-flex items-center gap-2 animate-pulse">
                Tap to see details
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 10l5 5 5-5" />
                </svg>
              </span>
            </div>
          </CardContent>
        ) : (
          <CardContent className="h-full p-8 backdrop-blur-sm" style={{ transform: 'rotateY(180deg)' }}>
            <div className="h-1/3 mb-6 relative">
              <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.7} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                <FallbackModel color={getBgColor()} />
              </Canvas>
            </div>
            
            <div className="h-2/3 overflow-y-auto text-white">
              <h2 className="text-3xl font-bold mb-4">{movie.title} ({movie.year})</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-black/20 backdrop-blur-md rounded-xl p-3">
                  <p className="text-sm opacity-70 mb-1">Director</p>
                  <p className="font-medium">{movie.director}</p>
                </div>
                <div className="bg-black/20 backdrop-blur-md rounded-xl p-3">
                  <p className="text-sm opacity-70 mb-1">Duration</p>
                  <p className="font-medium">{movie.duration} minutes</p>
                </div>
              </div>
              
              <p className="text-sm opacity-70 mb-2">Mood</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {movie.mood.map((m, i) => (
                  <Badge key={i} variant="outline" className="bg-white/10 backdrop-blur-md border-white/10">
                    {m}
                  </Badge>
                ))}
              </div>
              
              <p className="text-sm opacity-70 mb-2">Description</p>
              <p className="mb-5 text-sm backdrop-blur-md bg-black/10 p-3 rounded-xl leading-relaxed">{movie.description}</p>
              
              <p className="text-sm opacity-70 mb-1">Popularity</p>
              <div className="w-full bg-black/30 rounded-full h-3 mb-6 overflow-hidden backdrop-blur-md">
                <div 
                  className="bg-white h-3 rounded-full" 
                  style={{ width: `${movie.popularity}%` }}
                />
              </div>
              
              <div className="text-center mt-6 text-white opacity-80 font-medium">
                <span className="inline-flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                  Tap to return
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default MovieCard;
