import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { formatCountdown, isEndingSoon, CATEGORY_EMOJI } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { engagementAPI } from '../../services/api';
import { toast } from '../../hooks/use-toast';

interface ListingCardProps {
  listing: any;
  onSaveToggle?: (id: string, isSaved: boolean) => void;
}

const CATEGORY_BG: Record<string, string> = {
  FOOD: 'bg-orange-100',
  DRINKS: 'bg-blue-100',
  APPAREL: 'bg-purple-100',
  SUPPLIES: 'bg-yellow-100',
  OTHER: 'bg-teal-100',
};

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
      if (new Date(listing.endTime).getTime() <= new Date().getTime()) clearInterval(timer);
    }, 60000);
    return () => clearInterval(timer);
  }, [listing.endTime, listing.status, isExpired]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isStudent) {
      toast({ title: 'Student account required', description: 'Only students can save listings.' });
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
    } catch {
      toast({ title: 'Action failed', description: 'Could not update saved status.', variant: 'destructive' });
    }
  };

  const emoji = CATEGORY_EMOJI[listing.category] || '🎁';
  const bgClass = CATEGORY_BG[listing.category] || 'bg-gray-100';
  const isActive = listing.status === 'ACTIVE' && !isExpired;

  return (
    <Link to={`/listings/${listing.id}`} className="block no-underline">
      <article className="flex flex-col bg-white">
        {/* Image area */}
        <div className="px-3">
          <div
            className={`w-full aspect-[4/5] rounded-[12px] relative flex items-center justify-center overflow-hidden ${bgClass}`}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
          >
            {listing.posterImageUrl ? (
              <img src={listing.posterImageUrl} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl drop-shadow-sm select-none">{emoji}</span>
            )}

            {/* Countdown badge */}
            <div
              className={`absolute top-3 right-3 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm ${
                endingSoon && isActive ? 'bg-red-500/90 text-white' : 'bg-white/90'
              }`}
            >
              {endingSoon && isActive
                ? <AlertTriangle className="w-3.5 h-3.5" />
                : <Clock className="w-3.5 h-3.5 text-gray-600" />}
              <span className={`text-xs font-semibold ${endingSoon && isActive ? 'text-white' : 'text-gray-900'}`}>
                {isActive ? countdown.replace('⏰ ', '') : 'Expired'}
              </span>
            </div>

            {/* Category badge */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <span className="text-xs font-semibold text-gray-800">
                {emoji} {listing.category.charAt(0) + listing.category.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-4 pt-3 pb-4 flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-[15px] leading-tight text-[#0a0a0a] line-clamp-2">
                {listing.title}
              </h2>
              <p className="text-[13px] font-medium text-gray-500 mt-0.5 truncate">
                {listing.postedByOrg?.orgName || 'DePaul Organization'}
              </p>
            </div>
            {isStudent && isActive && (
              <button
                onClick={handleSaveToggle}
                className="p-1 -mr-1 shrink-0 hover:opacity-70 active:scale-95 transition-all"
                aria-label={isSaved ? 'Unsave' : 'Save'}
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    isSaved ? 'fill-[#ff3040] text-[#ff3040]' : 'text-[#0a0a0a]'
                  }`}
                />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[13px] text-gray-600 truncate">
              {listing.buildingName}{listing.roomOrFloor ? `, ${listing.roomOrFloor}` : ''}
            </span>
          </div>

          {saveCount > 0 && (
            <div className="mt-1">
              <span className="text-[13px] font-semibold text-[#0a0a0a]">
                {saveCount} {saveCount === 1 ? 'save' : 'saves'}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
