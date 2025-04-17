
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import ProfileCard from "@/components/Dashboard/ProfileCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Music, Clock, Calendar, Heart } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSaveProfile = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Profile updated successfully");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                    <AvatarFallback className="text-lg">
                      {user?.user_metadata.name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{user?.user_metadata.name || 'User'}</h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        Change Avatar
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium">
                        Full Name
                      </label>
                      <Input
                        id="fullName"
                        defaultValue={user?.user_metadata.name || ''}
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium">
                        Username
                      </label>
                      <Input
                        id="username"
                        defaultValue={user?.user_metadata.name?.replace(/\s+/g, '').toLowerCase() || ''}
                        placeholder="Your username"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Your email is managed through your Spotify account and cannot be changed here.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </label>
                    <Input
                      id="bio"
                      placeholder="Tell us about yourself and your music taste"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
                <CardDescription>
                  Update your notification and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="checkbox" defaultChecked />
                    <span>Receive email notifications about new features</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="checkbox" defaultChecked />
                    <span>Allow others to see my playlists</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="checkbox" />
                    <span>Share my activity with others</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <ProfileCard />
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Member Since</span>
                    </div>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Music className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Playlists Created</span>
                    </div>
                    <span className="font-medium">12</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Last Activity</span>
                    </div>
                    <span className="font-medium">Today</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Favorites</span>
                    </div>
                    <span className="font-medium">24</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
