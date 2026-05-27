import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { CATEGORY_EMOJI } from '../../utils/formatters';

export function ListingSubmittedPage() {
  const location = useLocation();
  const listing = location.state?.listing;

  if (!listing) {
    return <Navigate to="/org/listings/new" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center max-w-2xl text-center">
      <div className="mb-6 animate-in zoom-in duration-500">
        <CheckCircle2 className="h-24 w-24 text-accent" />
      </div>
      
      <h1 className="text-4xl font-bold font-serif mb-4 text-foreground">Your listing is pending review</h1>
      <p className="text-lg text-muted-foreground mb-8">
        An admin will review your giveaway shortly. Once approved, it will be visible to all students.
      </p>

      <Card className="w-full mb-8 text-left border-gray-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md inline-block mb-2">
                PENDING REVIEW
              </div>
              <h3 className="font-bold text-xl">{listing.title}</h3>
            </div>
            <div className="text-4xl bg-muted p-2 rounded-xl">
              {CATEGORY_EMOJI[listing.category] || '🎁'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm mt-6 border-t pt-4">
            <div>
              <p className="text-muted-foreground font-semibold">Location</p>
              <p className="font-medium">{listing.buildingName} {listing.roomOrFloor}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold">Time</p>
              <p className="font-medium">
                {new Date(listing.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                {new Date(listing.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 w-full justify-center">
        <Button asChild variant="outline" className="w-48">
          <Link to="/org/listings">View My Listings</Link>
        </Button>
        <Button asChild className="w-48">
          <Link to="/org/listings/new">Post Another</Link>
        </Button>
      </div>
    </div>
  );
}
