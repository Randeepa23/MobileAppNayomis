import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, ExternalLink, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import TripAdvisorIcon from "@/components/icons/TripAdvisorIcon";

const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1a56a3] text-white py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Brand and History */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-5 font-serif">
              <span className="text-orange-400">Nayomi's</span>
            </h3>
            <p className="text-white/90 mb-3 sm:mb-4 text-sm sm:text-base">
              Established in 1976, with a distinguished heritage in the bakery industry.
            </p>
            <p className="text-white/80 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              Located in the heart of Katunayake, Negombo, we serve authentic Sri Lankan flavors crafted with fresh ingredients and time-honored recipes, bringing you the finest bakery and dining experience.
            </p>
            
            <div className="flex items-center mt-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300 mr-2" />
              <span className="text-white/80 text-sm sm:text-base">Katunayake, Negombo</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6 relative pl-3 border-l-4 border-orange-400">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-white/90 hover:text-orange-300 transition-smooth flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-white/90 hover:text-orange-300 transition-smooth flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('menu')}
                  className="text-white/90 hover:text-orange-300 transition-smooth flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                  Menu
                </button>
              </li>
              <li>
                <a 
                  href="/pre-order"
                  className="text-white/90 hover:text-orange-300 transition-smooth flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                  Pre Order Food
                </a>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('services')}
                  className="text-white/90 hover:text-orange-300 transition-smooth flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                  Services
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('gallery')}
                  className="text-white/90 hover:text-orange-300 transition-smooth flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                  Gallery
                </button>
              </li>
              <li>
                <a 
                  href="#contact"
                  className="text-white/90 hover:text-orange-300 transition-smooth flex items-center group"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 relative pl-3 border-l-4 border-orange-400">Follow Us</h4>
            <div className="flex gap-3 sm:gap-5 mb-6 sm:mb-8">
              <a 
                href="https://www.facebook.com/share/1GVzhNCEZ6/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1a478f] hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a 
                href="https://www.instagram.com/nayomiswaterfront/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1a478f] hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a 
                href="https://www.tripadvisor.com/Restaurant_Review-g1500185-d14769780-Reviews-Nayomi_s_Waterfront-Katunayake_Negombo_Western_Province.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1a478f] hover:bg-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md"
                aria-label="TripAdvisor"
              >
                <TripAdvisorIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <p className="text-white/80 flex items-center">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300 mr-2 sm:mr-3" />
                <span className="text-sm sm:text-base">+94 76 799 3874</span>
              </p>
              <p className="text-white/80 flex items-center">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300 mr-2 sm:mr-3" />
                <span className="text-sm sm:text-base">info@nayomis.com</span>
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-[#1a478f] my-6 sm:my-8" />
        
        <div className="pt-4 sm:pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-6">
            <p className="text-white/80 flex items-center text-xs sm:text-sm text-center md:text-left">
              © {new Date().getFullYear()}{" "}
              <span className="text-orange-400 font-semibold mx-1">Nayomi's</span>. All rights reserved.
            </p>
            <p className="text-white/70 text-xs sm:text-sm italic tracking-wide">A tradition of excellence since 1976</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;