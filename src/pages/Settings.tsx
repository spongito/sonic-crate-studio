
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Trash2, CreditCard, Crown } from "lucide-react";

const Settings = () => {
  const { subscription, signOut } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isPremium = subscription?.is_premium || false;
  
  const handleManageSubscription = async () => {
    // Placeholder for subscription management
    toast.success("Opening subscription management...");
  };
  
  const handleExportData = () => {
    toast.success("Your data export has been initiated. You will receive an email shortly.");
  };
  
  const handleDeleteAccount = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    // Simulate account deletion
    toast.success("Your account has been scheduled for deletion.");
    setTimeout(() => {
      signOut();
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how Assorted Audio looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Theme Mode</h3>
                  <p className="text-muted-foreground text-sm">
                    Toggle between light and dark mode
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Current Plan</h3>
                  <p className="text-muted-foreground text-sm">
                    {isPremium ? "Premium Plan" : "Free Plan"}
                  </p>
                </div>
                <div className={`${isPremium ? "bg-gold/20" : "bg-secondary"} px-3 py-1 rounded-full flex items-center`}>
                  {isPremium ? (
                    <>
                      <Crown className="h-4 w-4 text-gold mr-1" />
                      <span className="text-sm font-medium">Premium</span>
                    </>
                  ) : (
                    <span className="text-sm">Free Tier</span>
                  )}
                </div>
              </div>
              
              {isPremium && (
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Billing period</span>
                    <span className="text-sm font-medium">Monthly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Next billing date</span>
                    <span className="text-sm font-medium">June 15, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payment method</span>
                    <span className="text-sm font-medium flex items-center">
                      <CreditCard className="h-3 w-3 mr-1" /> •••• 4242
                    </span>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleManageSubscription}
                className={isPremium ? "bg-gold hover:bg-gold-dark text-black" : ""}
                variant={isPremium ? "default" : "outline"}
              >
                {isPremium ? "Manage Subscription" : "Upgrade to Premium"}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Your Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You can request a copy of your data or delete your account
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={handleExportData}>
                    Export Your Data
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="flex items-center gap-2"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="h-4 w-4" />
                    {showDeleteConfirm ? "Confirm Deletion" : "Delete Account"}
                  </Button>
                </div>
                
                {showDeleteConfirm && (
                  <p className="mt-3 text-sm text-red-500">
                    Warning: This action cannot be undone. All your playlists and data will be permanently removed.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
