
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import "./cover-templates.css";

interface CoverTemplateProps {
  name: string;
  aspectRatio?: number;
}

export const CoverTemplateB: React.FC<CoverTemplateProps> = ({ 
  name, 
  aspectRatio = 1 
}) => {
  return (
    <AspectRatio ratio={aspectRatio} className="overflow-hidden">
      <div className="cover-root cover-template-b">
        <h1>{name}</h1>
      </div>
    </AspectRatio>
  );
};
