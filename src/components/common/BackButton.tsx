
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  to?: string;
  className?: string;
  label?: string;
}

export const BackButton = ({ to, className, label }: BackButtonProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back in history
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={`flex items-center gap-1 hover:bg-background/10 mb-4 ${className || ''}`} 
      onClick={handleClick}
    >
      <ArrowLeft className="h-4 w-4" />
      {label || 'Back'}
    </Button>
  );
};

export default BackButton;
