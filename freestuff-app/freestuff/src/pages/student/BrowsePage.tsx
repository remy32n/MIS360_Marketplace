import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listingsAPI } from '../../services/api';
import { ListingCard } from '../../components/listings/ListingCard';
import { Search, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const CATEGORY_PILLS = [
  { id: 'ALL', label: 'All', emoji: '✨' },
  { id: 'FOOD', label: 'Food', emoji: '🍕' },
  { id: 'DRINKS', label: 'Drinks', emoji: '🥤' },
  { id: 'APPAREL', label: 'Merch', emoji: '👕' },
  { id: 'SUPPLIES', label: 'Supplies', emoji: '📚' },
  { id: 'OTHER', label: 'Other', emoji: '🎁' },
];

export function BrowsePage() {
  const { user, isOrg } = useAuth();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get('focus') === 'search') {
      searchRef.current?.focus();
    }
  }, [searchParams]);

  const fetchListings = async () => {
    try {
      const res = await listingsAPI.getAll({ search, category: category === 'ALL' ? undefined : category, sort: 'recent' });
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
  }, [search, category]);

  useEffect(() => {
    const interval = setInterval(fetchListings, 60000);
    return () => clearInterval(interval);
  }, [search, category]);

  return (
    <div className="flex flex-col">
      {isOrg && (
        <div className="mx-4 mt-4 bg-blue-50 border border-blue-100 text-blue-900 rounded-xl p-3 flex justify-between items-center text-sm">
          <p className="font-medium">Post a free giveaway for students</p>
          <Link to="/org/listings/new" className="font-bold text-blue-600 hover:opacity-70">Post →</Link>
        </div>
      )}

      {/* Search bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search for pizza, shirts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-[14px] text-[#0a0a0a] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#0095f6]/30 transition"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-2">
        {CATEGORY_PILLS.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              category === cat.id
                ? 'bg-[#0a0a0a] text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : listings.length > 0 ? (
        <div className="flex flex-col gap-6 pt-2 pb-4">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="text-5xl mb-4">👻</div>
          <h3 className="text-[17px] font-bold text-[#0a0a0a] mb-1">Nothing here yet</h3>
          <p className="text-[14px] text-gray-500">Try a different category or check back soon!</p>
        </div>
      )}
    </div>
  );
}
