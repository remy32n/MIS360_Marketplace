import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { CATEGORY_EMOJI, timeAgo } from '../../utils/formatters';
import { MapPin } from 'lucide-react';

interface ApprovalCardProps {
  listing: any;
  isSelected: boolean;
  onClick: () => void;
}

export function ApprovalCard({ listing, isSelected, onClick }: ApprovalCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-l-4 border-l-primary border-y-gray-200 border-r-gray-200 shadow-sm' : 'border-gray-100 shadow-sm'
      }`}
      onClick={onClick}
      data-testid={`approval-card-${listing.id}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label={listing.category}>
              {CATEGORY_EMOJI[listing.category] || '🎁'}
            </span>
            <div>
              <h4 className="font-bold text-sm line-clamp-1">{listing.title}</h4>
              <p className="text-xs text-muted-foreground">{listing.org?.orgName}</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(listing.createdAt)}</span>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground mt-2 mb-2">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="truncate">{listing.buildingName}</span>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mt-2">
          {listing.description}
        </p>
      </CardContent>
    </Card>
  );
}
