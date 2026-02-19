import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, MapPin, Phone, Lock, Activity, Calendar, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    location: string;
    profile_image: string;
    created_at: string;
    last_login: string;
    search_count: number;
}

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Form states
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");

    // Password states
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setPhone(data.phone || "");
                setLocation(data.location || "");
            } else {
                toast.error("Failed to fetch profile");
                if (response.status === 401) navigate("/login");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:5000/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ phone, location }),
            });

            if (response.ok) {
                toast.success("Profile updated successfully");
                fetchProfile(); // Refresh data
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            toast.error("Error updating profile");
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:5000/api/profile/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Password changed successfully");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(data.error || "Failed to change password");
            }
        } catch (error) {
            toast.error("Error changing password");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
                Loading profile...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-white">
                <p className="text-xl mb-4">Failed to load profile data.</p>
                <Button onClick={fetchProfile}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 text-white">
            <h1 className="text-3xl font-bold mb-8">User Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* User Info & Stats */}
                <div className="space-y-8">
                    <Card className="bg-card/50 backdrop-blur border-border/50 text-card-foreground">
                        <CardHeader className="text-center">
                            <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
                                <User className="h-12 w-12 text-primary" />
                            </div>
                            <CardTitle className="text-xl">{profile.name}</CardTitle>
                            <CardDescription>{profile.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Activity className="h-4 w-4" />
                                <span>Last Login: {profile.last_login ? new Date(profile.last_login).toLocaleString() : 'Never'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Search className="h-4 w-4" />
                                <span>Search Count: {profile.search_count || 0}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Profile & Security */}
                <div className="md:col-span-2 space-y-8">
                    {/* Edit Details */}
                    <Card className="bg-card/50 backdrop-blur border-border/50 text-card-foreground">
                        <CardHeader>
                            <CardTitle>Edit Profile</CardTitle>
                            <CardDescription>Update your personal information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name (Read Only)</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input value={profile.name || ''} disabled className="pl-9 bg-muted" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email (Read Only)</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input value={profile.email || ''} disabled className="pl-9 bg-muted" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="+1 234 567 890"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="City, Country"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                                    Update Profile
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card className="bg-card/50 backdrop-blur border-border/50 text-card-foreground">
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Change your password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            placeholder="Enter current password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="password"
                                                placeholder="Enter new password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="password"
                                                placeholder="Confirm new password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button type="submit" variant="destructive" className="w-full md:w-auto">
                                    Change Password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
