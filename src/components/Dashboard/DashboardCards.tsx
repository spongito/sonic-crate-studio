
import { Link } from "react-router-dom";
import { Music, Sparkles, Download, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const cards = [
  {
    title: "Playlist Generator",
    description: "Create AI-powered playlists based on any description",
    icon: <Music className="h-12 w-12 text-gold" />,
    link: "/dashboard",
    gradient: "from-[#2e1065] to-[#1e104d]"
  },
  {
    title: "New Music Finder",
    description: "Discover new artists and tracks matching your taste",
    icon: <Sparkles className="h-12 w-12 text-gold" />,
    link: "/assistant",
    gradient: "from-[#164e63] to-[#0f3443]"
  },
  {
    title: "Export Tools",
    description: "Export your playlists to your favorite platforms",
    icon: <Download className="h-12 w-12 text-gold" />,
    link: "/export",
    premium: true,
    gradient: "from-[#713f12] to-[#4d2b0c]"
  },
  {
    title: "Community Crates",
    description: "Discover and share playlists with the community",
    icon: <Users className="h-12 w-12 text-gold" />,
    link: "/community",
    gradient: "from-[#3b0764] to-[#2e1065]"
  },
];

const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="neo-card overflow-hidden group">
          <CardHeader className="pb-3 relative">
            <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300 scale-150">
              {card.icon}
            </div>
            <div className="mb-2 group-hover:animate-icon-wobble">{card.icon}</div>
            <CardTitle className="text-xl text-white/90 group-hover:text-gold transition-colors duration-300">{card.title}</CardTitle>
            <CardDescription className="text-white/60">{card.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {card.premium && (
              <div className="bg-gold/10 rounded-md p-3 mb-3 border border-gold/20">
                <span className="text-sm font-medium">
                  <span className="text-gold">Premium</span> feature
                </span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link to={card.link} className="w-full">
              <Button 
                className={card.premium ? "w-full neo-gold-button" : "w-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-gold/20 transition-all duration-300"} 
                variant={card.premium ? "default" : "outline"}
              >
                {card.premium ? "Upgrade to Access" : "Get Started"}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default DashboardCards;
