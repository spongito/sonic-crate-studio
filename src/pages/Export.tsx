import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Download, FileType, Music, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import UpgradeModal from "@/components/Dashboard/UpgradeModal";

const Export = () => {
  const { subscription } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const isPremium = subscription?.is_premium || false;

  const handleExport = (format: string) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    
    // Placeholder for export functionality
    toast.success(`Exporting playlist as ${format}`);
    
    if (format === "CSV" || format === "TXT") {
      // Simulate download
      setTimeout(() => {
        const element = document.createElement("a");
        const file = new Blob(
          [
            format === "CSV"
              ? "Title,Artist,Duration\nYe,Burna Boy,3:42\nEssence,WizKid ft. Tems,4:09"
              : "Soulful Afrobeat for Golden Hour\n\n1. Ye - Burna Boy (3:42)\n2. Essence - WizKid ft. Tems (4:09)"
          ],
          { type: format === "CSV" ? "text/csv" : "text/plain" }
        );
        element.href = URL.createObjectURL(file);
        element.download = `playlist.${format.toLowerCase()}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }, 1000);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Export Tools</h1>
          <p className="text-muted-foreground mt-2">
            Export your playlists to various formats or streaming platforms.
            {!isPremium && " Upgrade to Premium to unlock all export options."}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className={!isPremium ? "opacity-80" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileType className="h-5 w-5" />
                <span>CSV Export</span>
              </CardTitle>
              <CardDescription>
                Export your playlist as a CSV file for spreadsheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => handleExport("CSV")}
                disabled={!isPremium}
              >
                {isPremium ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export as CSV
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Premium Feature
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card className={!isPremium ? "opacity-80" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileType className="h-5 w-5" />
                <span>Text Export</span>
              </CardTitle>
              <CardDescription>
                Export your playlist as a simple text file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => handleExport("TXT")}
                disabled={!isPremium}
              >
                {isPremium ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export as TXT
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Premium Feature
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card className={!isPremium ? "opacity-80" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                <span>Spotify Export</span>
              </CardTitle>
              <CardDescription>
                Export directly to your Spotify playlists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => handleExport("Spotify")}
                disabled={!isPremium}
              >
                {isPremium ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export to Spotify
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Premium Feature
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card className={!isPremium ? "opacity-80" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                <span>Apple Music</span>
              </CardTitle>
              <CardDescription>
                Export directly to your Apple Music library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => handleExport("Apple Music")}
                disabled={!isPremium}
              >
                {isPremium ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export to Apple Music
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Premium Feature
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {!isPremium && (
          <div className="mt-10 bg-gold/10 rounded-lg border border-gold/30 p-6">
            <div className="flex items-start gap-4">
              <div className="bg-gold/20 p-2 rounded-full">
                <Crown className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Unlock Premium Features</h3>
                <p className="text-muted-foreground mb-4">
                  Upgrade to Premium to unlock all export options, unlimited generation, and more.
                </p>
                <Button 
                  className="bg-gold hover:bg-gold-dark text-black"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </DashboardLayout>
  );
};

export default Export;
