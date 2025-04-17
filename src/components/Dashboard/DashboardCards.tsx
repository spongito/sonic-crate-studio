
import { Link } from "react-router-dom";
import { Music, Bot, Download, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const cards = [
  {
    title: "Playlist Generator",
    description: "Create AI-powered playlists based on any description",
    icon: <Music className="h-10 w-10 text-gold" />,
    link: "/dashboard",
  },
  {
    title: "Music Assistant",
    description: "Chat with our AI assistant about music and get recommendations",
    icon: <Bot className="h-10 w-10 text-gold" />,
    link: "/assistant",
  },
  {
    title: "Export Tools",
    description: "Export your playlists to your favorite platforms",
    icon: <Download className="h-10 w-10 text-gold" />,
    link: "/export",
    premium: true,
  },
  {
    title: "Community Crates",
    description: "Discover and share playlists with the community",
    icon: <Users className="h-10 w-10 text-gold" />,
    link: "/community",
  },
];

const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="mb-2">{card.icon}</div>
            <CardTitle>{card.title}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {card.premium && (
              <div className="bg-gold/10 rounded-md p-3 mb-3">
                <span className="text-sm font-medium">
                  <span className="text-gold">Premium</span> feature
                </span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link to={card.link} className="w-full">
              <Button 
                className={card.premium ? "w-full bg-gold hover:bg-gold-dark text-black" : "w-full"} 
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
