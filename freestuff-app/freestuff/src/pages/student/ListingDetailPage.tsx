import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listingsAPI, engagementAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Loader2, MapPin, Clock, Share, Bookmark, AlertTriangle, Eye, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { formatCountdown, isEndingSoon, CATEGORY_EMOJI } from '../../utils/formatters';
import { ListingBadge } from '../../components/listings/ListingBadge';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../hooks/use-toast';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isStudent, isAdmin } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [endingSoon, setEndingSoon] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await listingsAPI.getById(id!);
      setListing(res.data);
      setIsSaved(res.data.isSaved);
      setCountdown(formatCountdown(res.data.endTime));
      setEndingSoon(isEndingSoon(res.data.endTime));
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load listing.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!listing || listing.status !== 'ACTIVE') return;
    const timer = setInterval(() => {
      setCountdown(formatCountdown(listing.endTime));
      setEndingSoon(isEndingSoon(listing.endTime));
    }, 60000);
    return () => clearInterval(timer);
  }, [listing]);

  const handleSave = async () => {
    if (!isStudent) return;
    try {
      if (isSaved && listing.savedId) {
        await engagementAPI.unsaveListing(listing.savedId);
        setIsSaved(false);
        setListing({ ...listing, saveCount: Math.max(0, listing.saveCount - 1), savedId: null });
      } else {
        const res = await engagementAPI.saveListing(listing.id);
        setIsSaved(true);
        setListing({ ...listing, saveCount: listing.saveCount + 1, savedId: res.data.savedId });
      }
    } catch (err) {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Link copied to clipboard." });
  };

  const handleAdminAction = async (status: string) => {
    try {
      await listingsAPI.updateStatus(listing.id, status);
      toast({ title: `Listing marked as ${status}` });
      fetchListing();
    } catch (err) {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!listing) {
    return <div className="text-center py-20">Listing not found</div>;
  }

  const categoryEmoji = CATEGORY_EMOJI[listing.category] || '🎁';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/browse" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to browse
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm relative">
            {listing.posterImageUrl ? (
              <img src={listing.posterImageUrl} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-8xl">{categoryEmoji}</div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-white/90 text-foreground hover:bg-white/90 backdrop-blur-sm shadow-sm border-0">
                {categoryEmoji} {listing.category}
              </Badge>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col">
          <div className="mb-2">
            <ListingBadge status={listing.status} />
          </div>
          
          <h1 className="text-4xl font-bold font-serif mb-2 leading-tight">{listing.title}</h1>
          
          <div className="flex items-center text-muted-foreground mb-6">
            <span className="font-medium flex items-center">
              Posted by {listing.postedByOrg?.orgName}
              {listing.postedByOrg?.verificationStatus === 'VERIFIED' && <CheckCircle2 className="h-4 w-4 ml-1 text-primary" />}
            </span>
            <span className="mx-2">•</span>
            <span className="flex items-center"><Eye className="h-4 w-4 mr-1" /> {listing.viewCount || 0}</span>
            <span className="mx-2">•</span>
            <span className="flex items-center"><Bookmark className="h-4 w-4 mr-1" /> {listing.saveCount || 0}</span>
          </div>

          <div className="prose prose-sm max-w-none text-foreground mb-8">
            <p className="text-lg whitespace-pre-wrap">{listing.description}</p>
          </div>

          <Card className="mb-8 border-gray-200 shadow-sm bg-gray-50/50">
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center uppercase tracking-wider">
                  <MapPin className="h-4 w-4 mr-1" /> Location
                </h3>
                <p className="font-medium text-lg">{listing.buildingName}</p>
                {listing.roomOrFloor && <p className="text-muted-foreground">{listing.roomOrFloor}</p>}
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center uppercase tracking-wider">
                  <Clock className="h-4 w-4 mr-1" /> Availability
                </h3>
                <div className={`font-medium text-lg ${endingSoon && listing.status === 'ACTIVE' ? 'text-destructive' : ''}`}>
                  {listing.status === 'ACTIVE' ? countdown : 'Expired'}
                </div>
                <p className="text-muted-foreground text-sm">
                  {new Date(listing.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(listing.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-auto">
            {isStudent && listing.status === 'ACTIVE' && (
              <Button 
                size="lg" 
                className={`flex-1 ${isSaved ? 'bg-accent hover:bg-accent/90 text-white' : ''}`}
                onClick={handleSave}
              >
                <Bookmark className={`h-5 w-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save This Item'}
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={handleShare}>
              <Share className="h-5 w-5 mr-2" /> Share
            </Button>
          </div>

          {isAdmin && (
            <Card className="mt-8 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <h3 className="font-bold text-red-800 mb-2">Admin Actions</h3>
                <div className="flex gap-2">
                  {listing.status === 'PENDING' && (
                    <>
                      <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleAdminAction('APPROVED')}>Approve</Button>
                      <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50" onClick={() => handleAdminAction('REJECTED')}>Reject</Button>
                    </>
                  )}
                  {listing.status === 'ACTIVE' && (
                    <Button variant="destructive" onClick={() => handleAdminAction('REMOVED')}>Remove Listing</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
