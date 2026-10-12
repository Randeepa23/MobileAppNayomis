import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./gallery.css";

// Import all images
import image10 from "../assets/10.webp";
import image11 from "../assets/11.webp";
import image12 from "../assets/12.webp";
import image13 from "../assets/13.webp";
import image14 from "../assets/14.jpg";
import image15 from "../assets/15.jpg";
import image16 from "../assets/16.jpg";
import image17 from "../assets/17.jpg";
import image18 from "../assets/18.jpg";
import image19 from "../assets/19.webp";
import image20 from "../assets/20.webp";
import image21 from "../assets/21.webp";
import image22 from "../assets/22.webp";
import image23 from "../assets/23.webp";
import image24 from "../assets/24.jpg";

// Gallery component
const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    // Add a small delay to ensure smooth animation when component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Define all images with their categories
  // Gallery images with improved descriptions for better accessibility
  const galleryImages = [
    { src: image10, alt: "Elegant Restaurant Interior with Waterfront View", category: "interior" },
    { src: image11, alt: "Gourmet Food Dish Presentation", category: "food" },
    { src: image12, alt: "Scenic Waterfront View at Sunset", category: "view" },
    { src: image13, alt: "Sophisticated Restaurant Setting with Ambient Lighting", category: "interior" },
    { src: image14, alt: "Chef's Special Seafood Dish", category: "food" },
    { src: image15, alt: "Outdoor Waterfront Dining Experience", category: "view" },
    { src: image16, alt: "Signature Craft Cocktail with Garnish", category: "drinks" },
    { src: image17, alt: "Artfully Plated Chef's Special", category: "food" },
    { src: image18, alt: "Stunning Waterfront Scenery at Dusk", category: "view" },
    { src: image19, alt: "Exquisite Dessert Selection with Decorative Elements", category: "food" },
    { src: image20, alt: "Premium Dining Experience with Table Setting", category: "interior" },
    { src: image21, alt: "Fresh Seafood Platter with Local Catch", category: "food" },
    { src: image22, alt: "Breathtaking Sunset View Over the Water", category: "view" },
    { src: image23, alt: "Specialty Handcrafted Beverage with Fresh Ingredients", category: "drinks" },
    { src: image24, alt: "Sophisticated Restaurant Ambiance with Water Views", category: "interior" },
  ];
  
  // Filter images based on selected category
  const filteredImages = category === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === category);
    
  // Open the lightbox with selected image
  const openLightbox = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    document.body.style.overflow = "hidden"; // Prevent scrolling when lightbox is open
  };
  
  // Close the lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "auto"; // Restore scrolling
  };

  return (
    <section id="gallery" className="py-20 bg-blue-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full -ml-48 -mb-48"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Our Gallery
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take a visual journey through our restaurant, cuisine, and picturesque waterfront views
          </p>
          <div className="w-20 h-1 gradient-gold mx-auto mt-4 rounded-full"></div>
        </div>
        
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["all", "food", "interior", "view", "drinks"].map((cat, index) => (
            <motion.button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full font-medium transition-all ${
                category === cat
                  ? "gradient-gold text-primary shadow-gold scale-105"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </motion.button>
          ))}
        </div>
        
        {/* Gallery grid with staggered animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredImages.map((image, index) => (
            <motion.div
              key={index}
              className="relative overflow-hidden rounded-lg shadow-elegant h-72 cursor-pointer group"
              onClick={() => openLightbox(image.src)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.08,
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1] 
              }}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.3)" 
              }}
              layout
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="px-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-medium text-lg text-center">
                    {image.alt}
                  </p>
                  <div className="w-12 h-0.5 bg-accent mx-auto mt-3"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Enhanced Lightbox for image viewing */}
      {selectedImage && (
        <motion.div 
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            className="absolute top-5 right-5 text-white text-3xl hover:text-accent transition-colors duration-300"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            &times;
          </button>
          <motion.img 
            src={selectedImage} 
            alt="Gallery preview" 
            className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Navigation hints */}
          <div className="absolute bottom-6 left-0 right-0 text-center text-white/70 text-sm">
            Click anywhere outside the image to close
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default Gallery;