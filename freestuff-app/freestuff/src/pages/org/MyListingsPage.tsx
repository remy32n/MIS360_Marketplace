import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingsAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { ListingBadge } from '../../components/listings/ListingBadge';
import { Loader2, Plus, AlertCircle, MapPin, Clock } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { CATEGORY_EMOJI, formatCountdown } from '../../utils/formatters';

const STATUS_TABS = ['ALL', 'PENDING', 'ACTIVE', 'EXPIRED', 'REMOVED', 'REJECTED'];

export function MyListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchListings = async () => {
    try {
      const res = await listingsAPI.getMine();
      setListings(res.data.listings || res.data);
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to load listings', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this listing from the platform?')) return;
    try {
      await listingsAPI.remove(id);
      toast({ title: 'Listing removed.' });
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'REMOVED' } : l));
    } catch {
      toast({ title: 'Failed to remove listing', variant: 'destructive' });
    }
  };

  const filtered = filter === 'ALL' ? listings : listings.filter(l => l.status === filter);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">My Listings</h1>
          <p className="text-muted-foreground">Manage your organization's giveaways.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-sm">
          <Link to="/org/listings/new"><Plus className="mr-2 h-4 w-4" /> Post New Listing</Link>
        </Button>
      </div>

      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar">
        {STATUS_TABS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            {f !== 'ALL' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({listings.filter(l => l.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">{filter === 'ALL' ? 'No listings yet' : `No ${filter.toLowerCase()} listings`}</h3>
          {filter === 'ALL' && (
            <Button asChild className="mt-4">
              <Link to="/org/listings/new"><Plus className="mr-2 h-4 w-4" /> Post Your First Listing</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(listing => (
            <div key={listing.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                {listing.posterImageUrl
                  ? <img src={listing.posterImageUrl} alt="" className="w-full h-full object-cover" />
                  : CATEGORY_EMOJI[listing.category] || '🎁'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg leading-tight">{listing.title}</h3>
                  <ListingBadge status={listing.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {listing.buildingName}
                    {listing.roomOrFloor && `, ${listing.roomOrFloor}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {listing.status === 'ACTIVE' ? formatCountdown(listing.endTime) : new Date(listing.endTime).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
              </div>

              <div className="flex sm:flex-col gap-2 sm:items-end justify-end shrink-0">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/listings/${listing.id}`}>View</Link>
                </Button>
                {(listing.status === 'ACTIVE' || listing.status === 'PENDING') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/30 text-destructive hover:bg-destructive/5"
                    onClick={() => handleDelete(listing.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
