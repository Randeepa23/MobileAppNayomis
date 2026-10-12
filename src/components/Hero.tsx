import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import restaurantImage1 from "../assets/3.png";
import restaurantImage2 from "../assets/4.png";
import restaurantImage3 from "../assets/5.png";
import dashboardImage1 from "../assets/Delicious.png";
import dashboardImage2 from "../assets/short eats.png";
import dashboardImage3 from "../assets/Enjoy Your Happy Meal.png";

interface HeroProps {
  variant?: 'restaurant' | 'dashboard';
}

const Hero = ({ variant = 'restaurant' }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Select images based on variant
  const images = variant === 'dashboard' 
    ? [dashboardImage1, dashboardImage2, dashboardImage3]
    : [restaurantImage1, restaurantImage2, restaurantImage3];
  const { scrollY } = useScroll();
  
  // Subtle parallax layers at different speeds
  const yBackground = useTransform(scrollY, [0, 1000], [0, 200]);
  const yContent = useTransform(scrollY, [0, 1000], [0, 100]);
  const yParticles = useTransform(scrollY, [0, 1000], [0, 50]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-900 pt-[134px]"
    >
      {/* Background Images with Parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: yBackground, scale }}
      >
        {images.map((image, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                width: '100%',
                height: '100%'
              }}
            />
          </div>
        ))}
        {/* Lighter Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      </motion.div>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {images.map((_, index) => (
          <motion.button 
            key={index}
            onClick={() => setCurrentIndex(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === index 
                ? 'w-8 bg-white' 
                : 'w-2 bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.button
          onClick={scrollToMenu}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors group"
        >
          <ChevronDown className="h-6 w-6 group-hover:translate-y-1 transition-transform" />
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Hero;