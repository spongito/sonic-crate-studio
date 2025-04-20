
import React from "react";
import { Youtube, Music } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export interface PlatformSelectorProps {
  platforms: Platform[];
  onChange: (platforms: Platform[]) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ platforms, onChange }) => {
  const togglePlatform = (platformId: string) => {
    const updatedPlatforms = platforms.map((platform) => 
      platform.id === platformId 
        ? { ...platform, enabled: !platform.enabled } 
        : platform
    );
    
    // Ensure at least one platform is enabled
    if (updatedPlatforms.some(p => p.enabled)) {
      onChange(updatedPlatforms);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">Platforms</label>
      <div className="flex flex-wrap gap-3">
        {platforms.map((platform) => (
          <div 
            key={platform.id} 
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer
              ${platform.enabled 
                ? "bg-white/10 border-white/20" 
                : "bg-transparent border-white/5 opacity-70"
              }
              transition-all hover:bg-white/5
            `}
            onClick={() => togglePlatform(platform.id)}
          >
            <Checkbox 
              id={`platform-${platform.id}`}
              checked={platform.enabled}
              onCheckedChange={() => togglePlatform(platform.id)} 
              className="data-[state=checked]:bg-gold data-[state=checked]:text-black"
            />
            <div className="flex items-center gap-1.5">
              {platform.icon}
              <span>{platform.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const getDefaultPlatforms = (): Platform[] => [
  {
    id: "spotify",
    name: "Spotify",
    icon: <Music className="h-4 w-4" />,
    enabled: true,
  },
  {
    id: "youtube",
    name: "YouTube Audio",
    icon: <Youtube className="h-4 w-4" />,
    enabled: true,
  }
];
