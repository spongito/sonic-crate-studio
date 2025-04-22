
interface GenerationLimitProps {
  subscription: any;
}

export const GenerationLimit = ({ subscription }: GenerationLimitProps) => {
  return (
    <p className="text-xs text-muted-foreground mt-4 sm:mt-6 text-center">
      Free tier: 15 generations per month
    </p>
  );
};
