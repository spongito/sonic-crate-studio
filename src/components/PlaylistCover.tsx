
import React from 'react';
import { CoverTemplateA } from './CoverTemplates/CoverTemplateA';
import { CoverTemplateB } from './CoverTemplates/CoverTemplateB';
import { CoverTemplateC } from './CoverTemplates/CoverTemplateC';

export type CoverTemplate = 'A' | 'B' | 'C';

export interface PlaylistCoverProps {
  name: string;
  template: CoverTemplate;
  aspectRatio?: number;
}

export const PlaylistCover: React.FC<PlaylistCoverProps> = ({ 
  name, 
  template,
  aspectRatio = 1
}) => {
  switch (template) {
    case 'A':
      return <CoverTemplateA name={name} aspectRatio={aspectRatio} />;
    case 'B':
      return <CoverTemplateB name={name} aspectRatio={aspectRatio} />;
    case 'C':
      return <CoverTemplateC name={name} aspectRatio={aspectRatio} />;
    default:
      return <CoverTemplateA name={name} aspectRatio={aspectRatio} />;
  }
};

// Example usage:
// <PlaylistCover name="Chill Vibes" template="A" />
// <PlaylistCover name="Workout Mix" template="B" />
// <PlaylistCover name="FOCUS BEATS" template="C" />
