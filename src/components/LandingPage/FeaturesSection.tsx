
import { Music, Bot, Download, Share2 } from "lucide-react";

const features = [
  {
    title: "AI Playlist Generator",
    description: "Describe the vibe you want, and our AI will curate the perfect mix.",
    icon: <Music className="h-10 w-10 text-gold" />,
  },
  {
    title: "Music Assistant",
    description: "Get song suggestions, music facts, and curated recommendations.",
    icon: <Bot className="h-10 w-10 text-gold" />,
  },
  {
    title: "Export & Download",
    description: "Export your playlists to popular platforms or download as tracklists.",
    icon: <Download className="h-10 w-10 text-gold" />,
    premium: true,
  },
  {
    title: "Community Sharing",
    description: "Share your curated sets with the community and discover new music.",
    icon: <Share2 className="h-10 w-10 text-gold" />,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" id="features">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
          Explore The Full Suite
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-morphism p-6 rounded-xl flex flex-col items-center text-center transition-all duration-300 hover:scale-105"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
              {feature.premium && (
                <span className="mt-3 px-3 py-1 text-xs rounded-full bg-gold text-black font-semibold">
                  Premium
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
