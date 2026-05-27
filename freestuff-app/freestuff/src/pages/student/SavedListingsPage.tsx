import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { engagementAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Loader2, BookmarkX, MapPin, Clock } from 'lucide-react';
import { formatCountdown, CATEGORY_EMOJI, timeAgo } from '../../utils/formatters';
import { toast } from '../../hooks/use-toast';

export function SavedListingsPage() {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchSaved = async () => {
    try {
      const res = await engagementAPI.getSaved();
      setSavedItems(res.data.savedListings || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (id: string, savedId: string) => {
    try {
      await engagementAPI.unsaveListing(savedId);
      setSavedItems(savedItems.filter(item => item.id !== savedId));
      toast({ title: "Listing removed from saved" });
    } catch (err) {
      toast({ title: "Failed to unsave", variant: "destructive" });
    }
  };

  const filteredItems = savedItems.filter(item => {
    const listing = item.listing;
    if (!listing) return false;
    if (filter === 'ACTIVE') return listing.status === 'ACTIVE';
    if (filter === 'EXPIRED') return listing.status !== 'ACTIVE';
    return true;
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-serif">Saved Items ({savedItems.length})</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {['ALL', 'ACTIVE', 'EXPIRED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f === 'ALL' ? 'All' : f === 'ACTIVE' ? 'Available' : 'Expired'}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <BookmarkX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">No saved items found</h3>
          <Button asChild className="mt-4"><Link to="/browse">Browse Listings</Link></Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredItems.map(({ id, listing, createdAt }) => (
            <Card key={id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="w-full sm:w-40 aspect-video sm:aspect-square shrink-0 bg-muted flex items-center justify-center text-4xl">
                  {listing.posterImageUrl ? (
                    <img src={listing.posterImageUrl} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    CATEGORY_EMOJI[listing.category] || '🎁'
                  )}
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg line-clamp-1">{listing.title}</h3>
                    <span className="text-xs font-medium text-muted-foreground bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap ml-4">
                      {listing.status === 'ACTIVE' ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{listing.postedByOrg?.orgName}</p>
                  
                  <div className="flex gap-4 text-sm text-muted-foreground mb-4 mt-auto">
                    <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 shrink-0" /> {listing.buildingName}</span>
                    <span className="flex items-center"><Clock className="h-4 w-4 mr-1 shrink-0" /> {formatCountdown(listing.endTime)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                    <span className="text-xs text-muted-foreground">Saved {timeAgo(createdAt)}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleUnsave(listing.id, id)} className="text-muted-foreground hover:text-destructive">
                        Remove
                      </Button>
                      <Button size="sm" asChild>
                        <Link to={`/listings/${listing.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
