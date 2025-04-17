
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-10 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-gold to-gold-dark mr-2"></div>
            <span className="font-semibold">Assorted Audio</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
              <Link to="/" className="hover:text-gold transition-colors">Home</Link>
              <Link to="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-gold transition-colors">Terms</Link>
              <a href="mailto:contact@assortedaudio.com" className="hover:text-gold transition-colors">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Assorted Audio. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
