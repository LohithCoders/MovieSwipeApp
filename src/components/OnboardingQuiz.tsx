import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckIcon } from 'lucide-react';
import { UserPreferences } from '@/types/movie';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

const GENRES = [
  "Action", "Comedy", "Drama", "Horror", 
  "Sci-Fi", "Romance", "Documentary", "Thriller", 
  "Animation", "Fantasy"
];

const ERAS = [
  { value: "classic", label: "Classic (Pre-1980)" },
  { value: "modern", label: "Modern (1980-2010)" },
  { value: "recent", label: "Recent (2010+)" }
];

const MOODS = [
  { value: "exciting", label: "Exciting" },
  { value: "thoughtful", label: "Thoughtful" },
  { value: "happy", label: "Happy" },
  { value: "dark", label: "Dark" },
  { value: "inspiring", label: "Inspiring" }
];

interface AnimatedCubeProps {
  position: [number, number, number];
  color: string;
  active?: boolean;
}

// Simplified cube component that doesn't use react-spring
const AnimatedCube: React.FC<AnimatedCubeProps> = ({ position, color, active = false }) => {
  return (
    <mesh position={position} scale={active ? 1.2 : 1}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
    </mesh>
  );
};

const Background3D = ({ step }: { step: number }) => {
  const cubeColors = [
    "#9b87f5", // purple for genres
    "#7E69AB", // darker purple for eras
    "#6E59A5", // even darker for mood
  ];

  return (
    <Canvas className="absolute inset-0 -z-10">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      <AnimatedCube position={[-3, -1, -5]} color={cubeColors[0]} active={step === 0} />
      <AnimatedCube position={[3, 1, -7]} color={cubeColors[1]} active={step === 1} />
      <AnimatedCube position={[-2, 2, -6]} color={cubeColors[2]} active={step === 2} />
      <AnimatedCube position={[4, -2, -8]} color={cubeColors[0]} active={step === 0} />
      <AnimatedCube position={[-4, 0, -9]} color={cubeColors[1]} active={step === 1} />
      <AnimatedCube position={[0, -3, -7]} color={cubeColors[2]} active={step === 2} />
    </Canvas>
  );
};

interface OnboardingQuizProps {
  onComplete: (preferences: UserPreferences) => void;
}

const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [genres, setGenres] = useState<string[]>([]);
  const [era, setEra] = useState('');
  const [mood, setMood] = useState('');

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter(g => g !== genre));
    } else {
      if (genres.length < 3) {
        setGenres([...genres, genre]);
      }
    }
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete({ genres, era, mood });
    }
  };

  const canContinue = () => {
    switch (step) {
      case 0: return genres.length > 0;
      case 1: return era !== '';
      case 2: return mood !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Select up to 3 genres you enjoy</h2>
            <div className="grid grid-cols-2 gap-3">
              {GENRES.map(genre => (
                <Button
                  key={genre}
                  variant={genres.includes(genre) ? "default" : "outline"}
                  className={`justify-start ${genres.includes(genre) ? 'bg-primary' : 'hover:bg-primary/20'}`}
                  onClick={() => toggleGenre(genre)}
                >
                  {genres.includes(genre) && <CheckIcon className="mr-2 h-4 w-4" />}
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">What era of movies do you prefer?</h2>
            <div className="flex flex-col space-y-3">
              {ERAS.map(eraOption => (
                <Button
                  key={eraOption.value}
                  variant={era === eraOption.value ? "default" : "outline"}
                  className={era === eraOption.value ? 'bg-primary' : 'hover:bg-primary/20'}
                  onClick={() => setEra(eraOption.value)}
                >
                  {eraOption.label}
                </Button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">What mood are you looking for?</h2>
            <div className="flex flex-col space-y-3">
              {MOODS.map(moodOption => (
                <Button
                  key={moodOption.value}
                  variant={mood === moodOption.value ? "default" : "outline"}
                  className={mood === moodOption.value ? 'bg-primary' : 'hover:bg-primary/20'}
                  onClick={() => setMood(moodOption.value)}
                >
                  {moodOption.label}
                </Button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      <Background3D step={step} />
      
      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-black/70 backdrop-blur-md border-primary/50">
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                CinemaSwipe
              </h1>
              
              {renderStep()}
              
              <div className="mt-8 flex justify-between">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                <div className={step === 0 ? 'w-full' : ''}>
                  <Button 
                    className={`w-full ${!canContinue() ? 'opacity-50' : ''}`}
                    disabled={!canContinue()} 
                    onClick={handleNext}
                  >
                    {step === 2 ? 'Start Discovering' : 'Next'}
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((s) => (
                    <div 
                      key={s} 
                      className={`h-2 w-2 rounded-full ${s === step ? 'bg-primary' : 'bg-gray-600'}`} 
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingQuiz;
