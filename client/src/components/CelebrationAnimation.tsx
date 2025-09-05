import { Coins, Sparkles, Star } from "lucide-react";
import React, { useEffect, useState } from "react";

interface CelebrationAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  pointsAdded?: number;
}

const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  isVisible,
  onComplete,
  pointsAdded = 0,
}) => {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      rotation: number;
      scale: number;
      delay: number;
      type: "coin" | "star" | "sparkle";
    }>
  >([]);

  useEffect(() => {
    if (isVisible) {
      // Generate random particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        delay: Math.random() * 2000,
        type: ["coin", "star", "sparkle"][Math.floor(Math.random() * 3)] as
          | "coin"
          | "star"
          | "sparkle",
      }));

      setParticles(newParticles);

      // Complete animation after 4 seconds
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const getParticleIcon = (type: string) => {
    switch (type) {
      case "coin":
        return <Coins className="w-6 h-6 text-yellow-400" />;
      case "star":
        return <Star className="w-5 h-5 text-blue-400" fill="currentColor" />;
      case "sparkle":
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      default:
        return <Coins className="w-6 h-6 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 animate-fade-in" />

      {/* Success Message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gradient-primary text-white px-8 py-6 rounded-2xl shadow-glow animate-scale-in text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Coins className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Points Added Successfully!
          </h2>
          <p className="text-white/90 text-lg">
            +{pointsAdded.toLocaleString()} points credited
          </p>
        </div>
      </div>

      {/* Falling Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-[fall_3s_ease-in_forwards]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: "3s",
          }}
        >
          {getParticleIcon(particle.type)}
        </div>
      ))}

      {/* Additional floating elements */}
      <div className="absolute top-1/4 left-1/4 animate-[float_2s_ease-in-out_infinite] opacity-60">
        <Star className="w-8 h-8 text-yellow-300" fill="currentColor" />
      </div>
      <div
        className="absolute top-1/3 right-1/4 animate-[float_2.5s_ease-in-out_infinite] opacity-60"
        style={{ animationDelay: "0.5s" }}
      >
        <Sparkles className="w-6 h-6 text-cyan-300" />
      </div>
      <div
        className="absolute bottom-1/3 left-1/3 animate-[float_3s_ease-in-out_infinite] opacity-60"
        style={{ animationDelay: "1s" }}
      >
        <Coins className="w-10 h-10 text-yellow-400" />
      </div>
    </div>
  );
};

export default CelebrationAnimation;
