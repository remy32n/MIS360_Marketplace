import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from '../../hooks/use-toast';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

export function CreateListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Create default times: Start now, end in 2 hours
  const now = new Date();
  const later = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  const formatDateForInput = (date: Date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    buildingName: '',
    roomOrFloor: '',
    startTime: formatDateForInput(now),
    endTime: formatDateForInput(later),
    posterImageUrl: ''
  });

  const isVerified = user?.isVerified !== false; // Assuming undefined is true for safety, adjust based on actual API

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, category: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) return;

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      toast({ title: "Invalid times", description: "End time must be after start time", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await listingsAPI.create({
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      });
      navigate('/org/listings/submitted', { state: { listing: res.data } });
    } catch (err: any) {
      toast({
        title: "Failed to create listing",
        description: err.response?.data?.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-2xl border-gray-200 shadow-md">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold font-serif text-primary">Post a Free Giveaway</CardTitle>
          <p className="text-muted-foreground mt-2">Share free items with the DePaul community.</p>
        </CardHeader>
        <CardContent>
          {!isVerified && (
            <Alert className="mb-8 bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Account Pending Verification</AlertTitle>
              <AlertDescription className="text-yellow-700">
                Your organization account is currently under review by admins. You cannot post listings until verified.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">What are you giving away? <span className="text-destructive">*</span></Label>
              <Input id="title" placeholder="e.g. Free Pizza in the Loop!" value={formData.title} onChange={handleChange} required disabled={!isVerified} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
              <Select onValueChange={handleSelectChange} value={formData.category} required disabled={!isVerified}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOOD">🍕 Food</SelectItem>
                  <SelectItem value="DRINKS">🥤 Drinks</SelectItem>
                  <SelectItem value="APPAREL">👕 Apparel</SelectItem>
                  <SelectItem value="SUPPLIES">📚 Supplies</SelectItem>
                  <SelectItem value="OTHER">🎁 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <span className="text-xs text-muted-foreground">{formData.description.length}/500</span>
              </div>
              <Textarea 
                id="description" 
                placeholder="Details about the item, requirements, limits, etc." 
                value={formData.description} 
                onChange={handleChange} 
                maxLength={500} 
                rows={4}
                required 
                disabled={!isVerified}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buildingName">Building / Location <span className="text-destructive">*</span></Label>
                <Input id="buildingName" placeholder="e.g. DePaul Center" value={formData.buildingName} onChange={handleChange} required disabled={!isVerified} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomOrFloor">Room or Floor (Optional)</Label>
                <Input id="roomOrFloor" placeholder="e.g. 11th Floor, Room 1100" value={formData.roomOrFloor} onChange={handleChange} disabled={!isVerified} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Starts At <span className="text-destructive">*</span></Label>
                <Input id="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} required disabled={!isVerified} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Ends At <span className="text-destructive">*</span></Label>
                <Input id="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} required disabled={!isVerified} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="posterImageUrl">Poster Image URL (Optional)</Label>
              <Input id="posterImageUrl" type="url" placeholder="https://..." value={formData.posterImageUrl} onChange={handleChange} disabled={!isVerified} />
              <p className="text-xs text-muted-foreground">Provide a link to an image. (e.g. from imgur)</p>
            </div>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-bold text-lg h-12 rounded-xl" disabled={!isVerified || isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Submit for Review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
