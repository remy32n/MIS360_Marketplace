import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listingsAPI } from '../../services/api';
import { CategoryFilter } from '../../components/listings/CategoryFilter';
import { ListingCard } from '../../components/listings/ListingCard';
import { Input } from '../../components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Link } from 'react-router-dom';

export function BrowsePage() {
  const { user, isOrg } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState('recent');

  const fetchListings = async () => {
    try {
      const res = await listingsAPI.getAll({ search, category: category === 'ALL' ? undefined : category, sort });
      setListings(res.data.listings || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchListings();
  }, [search, category, sort]);

  useEffect(() => {
    const interval = setInterval(fetchListings, 60000);
    return () => clearInterval(interval);
  }, [search, category, sort]);

  return (
    <div className="container mx-auto px-4 py-8">
      {isOrg && (
        <div className="mb-6 bg-primary/10 border border-primary/20 text-primary-foreground text-primary rounded-xl p-4 flex justify-between items-center">
          <p className="font-medium">Switch to your org account to post a listing</p>
          <Link to="/org/listings/new" className="font-bold hover:underline">Post a listing &rarr;</Link>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif mb-2">
          Hey {user?.firstName}, here's what's free on campus right now 👋
        </h1>
        <p className="text-muted-foreground">Discover food, drinks, and merch around DePaul.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search for pizza, shirts, etc..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48 shrink-0">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="endingSoon">Ending Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="text-4xl mb-4">👻</div>
          <h3 className="text-xl font-bold mb-2">Nothing found here</h3>
          <p className="text-muted-foreground">Try adjusting your search or check back later!</p>
        </div>
      )}
    </div>
  );
}
