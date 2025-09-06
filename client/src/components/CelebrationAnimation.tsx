import { Sparkles, Star } from "lucide-react";
import React, { useEffect, useState } from "react";

interface CelebrationAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  pointsAdded?: number;
  noxAdded?: number;
  isUserDashboard?: boolean;
  changeType?: 'credit' | 'debit';

}

const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  isVisible,
  onComplete,
  pointsAdded = 0,
  isUserDashboard = false,
  changeType

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
      const newParticles = Array.from({ length: 100 }, (_, i) => ({
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
      }, 1000);


      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const getParticleIcon = (type: string) => {
    switch (type) {
      case "coin":
        return <img src='\public\icons8-coin-48.png' />;
      case "star":
        return <Star className="w-5 h-5 text-blue-400" fill="currentColor" />;
      case "sparkle":
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      default:
        return <img src="\public\icons8-coin-48.png" className="" />;
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
              <img src="\public\icons8-coin-48.png" className="" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isUserDashboard
              ? changeType === 'debit'
                ? 'Points Debited!'
                : 'Welcome to your Points Wallet!'
              : changeType === 'debit'
                ? 'Points Deducted!'
                : 'Points Added Successfully!'}
          </h2>
          <p className="text-white/90 text-lg mb-1">
            {isUserDashboard
              ? changeType === 'debit'
                ? `-${pointsAdded.toLocaleString()} points debited.`
                : `You have ${pointsAdded.toLocaleString()} points available.`
              : changeType === 'debit'
                ? `-${pointsAdded.toLocaleString()} points debited`
                : `+${pointsAdded.toLocaleString()} points credited`}
          </p>
          {isUserDashboard && changeType !== 'debit' && (

            <p className="text-white/70 text-base text-wrap">Start sending points and enjoy rewarding others!</p>
          )}
        </div>
      </div>

      {/* Falling Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-[fall_4s_ease-in_forwards]"
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
        <img src="\public\icons8-coin-48.png" className="" />
      </div>
    </div>
  );
};

export default CelebrationAnimation;
