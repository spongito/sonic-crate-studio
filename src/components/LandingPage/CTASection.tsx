
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-morphism rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Ready to Transform Your Music Journey?
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of music lovers and DJs who are discovering new sounds and creating perfect playlists with Assorted Audio.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-gold hover:bg-gold-dark text-black font-medium">
              Sign Up Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            No credit card required. 15 free generations every month.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
