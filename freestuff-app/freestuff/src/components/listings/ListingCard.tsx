import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Bookmark, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { formatCountdown, isEndingSoon, CATEGORY_EMOJI } from '../../utils/formatters';
import { ListingBadge } from './ListingBadge';
import { useAuth } from '../../hooks/useAuth';
import { engagementAPI } from '../../services/api';
import { toast } from '../../hooks/use-toast';

interface ListingCardProps {
  listing: any;
  onSaveToggle?: (id: string, isSaved: boolean) => void;
}

export function ListingCard({ listing, onSaveToggle }: ListingCardProps) {
  const { isStudent } = useAuth();
  const [isSaved, setIsSaved] = useState(listing.isSaved || false);
  const [saveCount, setSaveCount] = useState(listing.saveCount || 0);
  const [countdown, setCountdown] = useState(formatCountdown(listing.endTime));
  const [endingSoon, setEndingSoon] = useState(isEndingSoon(listing.endTime));
  const isExpired = new Date(listing.endTime).getTime() <= new Date().getTime();

  useEffect(() => {
    if (isExpired || listing.status !== 'ACTIVE') return;

    const timer = setInterval(() => {
      setCountdown(formatCountdown(listing.endTime));
      setEndingSoon(isEndingSoon(listing.endTime));
      
      if (new Date(listing.endTime).getTime() <= new Date().getTime()) {
        clearInterval(timer);
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [listing.endTime, listing.status, isExpired]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isStudent) {
      toast({
        title: "Student account required",
        description: "Only students can save listings.",
      });
      return;
    }

    try {
      if (isSaved && listing.savedId) {
        await engagementAPI.unsaveListing(listing.savedId);
        setIsSaved(false);
        setSaveCount((prev: number) => prev - 1);
        if (onSaveToggle) onSaveToggle(listing.id, false);
      } else {
        const res = await engagementAPI.saveListing(listing.id);
        setIsSaved(true);
        setSaveCount((prev: number) => prev + 1);
        listing.savedId = res.data.savedId;
        if (onSaveToggle) onSaveToggle(listing.id, true);
      }
    } catch (err) {
      toast({
        title: "Action failed",
        description: "Could not update saved status.",
        variant: "destructive"
      });
    }
  };

  const categoryEmoji = CATEGORY_EMOJI[listing.category] || '🎁';

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {listing.posterImageUrl ? (
          <img 
            src={listing.posterImageUrl} 
            alt={listing.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">{categoryEmoji}</div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-medium shadow-sm">
            {categoryEmoji} {listing.category}
          </div>
          {listing.status === 'ACTIVE' && <ListingBadge status={listing.status} />}
        </div>
        {isStudent && listing.status === 'ACTIVE' && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white"
            onClick={handleSaveToggle}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
          </Button>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-bold text-lg leading-tight line-clamp-2">{listing.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground font-medium">{listing.postedByOrg?.orgName || 'DePaul Organization'}</p>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1 flex flex-col gap-2">
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <MapPin className="h-4 w-4 mr-1 shrink-0" />
          <span className="truncate">{listing.buildingName}{listing.roomOrFloor ? `, ${listing.roomOrFloor}` : ''}</span>
        </div>
        
        {listing.status === 'ACTIVE' && !isExpired ? (
          <div className={`flex items-center text-sm font-medium mt-1 ${endingSoon ? 'text-destructive' : 'text-muted-foreground'}`}>
            {endingSoon ? <AlertTriangle className="h-4 w-4 mr-1 shrink-0" /> : <Clock className="h-4 w-4 mr-1 shrink-0" />}
            {countdown}
          </div>
        ) : (
          <div className="flex items-center text-sm font-medium mt-1 text-muted-foreground">
            <Clock className="h-4 w-4 mr-1 shrink-0" />
            Expired
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center mt-auto">
        <div className="text-xs text-muted-foreground font-medium flex items-center">
          {saveCount > 0 && (
            <span className="flex items-center">
              <Bookmark className="h-3 w-3 mr-1 fill-muted-foreground" />
              {saveCount} {saveCount === 1 ? 'save' : 'saves'}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="font-semibold text-primary hover:text-primary/80" asChild>
          <Link to={`/listings/${listing.id}`}>View Details &rarr;</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
