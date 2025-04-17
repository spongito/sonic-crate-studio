
import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizonal, Bot, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your music assistant. Ask me anything about music, artists, genres, or recommendations!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { subscription } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Check if user has reached generation limit
    if (subscription?.remaining_generations === 0 && !subscription?.is_premium) {
      toast.error("You've reached your monthly limit. Please upgrade to Premium.");
      return;
    }
    
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Simulate API call to AI assistant
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Example responses based on user input
      let response = "I'm not sure how to help with that. Could you be more specific about the music or artist you're interested in?";
      
      if (input.toLowerCase().includes("recommend") || input.toLowerCase().includes("suggest")) {
        response = "Based on your interests, I recommend checking out artists like Burna Boy, WizKid, and Tems for modern Afrobeat sounds. Their tracks 'Ye', 'Essence', and 'Higher' would be perfect for a golden hour playlist.";
      } else if (input.toLowerCase().includes("genre") || input.toLowerCase().includes("style")) {
        response = "There are countless music genres to explore! Some popular ones include Rock, Hip-Hop, Jazz, Electronic, Classical, R&B, and Folk. Each has its own rich history and sub-genres. Which one would you like to learn more about?";
      } else if (input.toLowerCase().includes("playlist")) {
        response = "To create a great playlist, consider starting with a theme or mood, vary the energy throughout, and aim for about 45-90 minutes of music. Try using the Playlist Generator feature for AI-powered recommendations!";
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Sorry, I couldn't process your request");
      console.error("Assistant error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Music Assistant</h1>
          <p className="text-muted-foreground mt-2">
            Chat with our AI music expert about artists, genres, recommendations, and more.
          </p>
        </div>
        
        <div className="bg-sidebar rounded-lg border border-sidebar-border h-[calc(100vh-15rem)] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-gold" />
                  </div>
                )}
                
                <div 
                  className={`
                    rounded-lg p-3 max-w-[80%] 
                    ${message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                    }
                  `}
                >
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-gold" />
                </div>
                <div className="bg-secondary rounded-lg p-4 max-w-[80%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="border-t border-sidebar-border p-3 flex gap-2">
            <Input
              placeholder="Ask about music, artists, or recommendations..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-background"
              disabled={isLoading}
            />
            <Button 
              type="submit"
              size="icon" 
              className="bg-gold text-black hover:bg-gold-dark"
              disabled={isLoading || !input.trim()}
            >
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assistant;
