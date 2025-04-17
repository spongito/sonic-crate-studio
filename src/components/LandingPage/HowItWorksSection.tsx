
import { Music, Search, Share2 } from "lucide-react";

const steps = [
  {
    title: "Describe Your Vibe",
    description: "Tell us the mood, genre, or occasion for your playlist.",
    icon: <Music className="h-8 w-8" />,
  },
  {
    title: "AI Finds The Perfect Tracks",
    description: "Our AI digs through thousands of songs to find the perfect matches.",
    icon: <Search className="h-8 w-8" />,
  },
  {
    title: "Share & Export",
    description: "Export to your favorite platform or share with the community.",
    icon: <Share2 className="h-8 w-8" />,
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative flex flex-col items-center text-center"
            >
              <div className="size-16 rounded-full bg-gold/10 flex items-center justify-center mb-6 relative z-10">
                {step.icon}
                <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-pulse-gold"></div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
              )}
              
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
