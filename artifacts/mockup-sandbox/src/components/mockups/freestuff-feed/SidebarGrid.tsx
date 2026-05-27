import React, { useState } from 'react';
import { 
  Home, 
  Bookmark, 
  PlusSquare, 
  User, 
  Search, 
  MapPin, 
  Clock, 
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Listing {
  id: string;
  title: string;
  category: string;
  emoji: string;
  location: string;
  timeRemaining: string;
  endingSoon: boolean;
  color: string;
}

const DEMO_LISTINGS: Listing[] = [
  { id: '1', title: 'Free Pizza at the Student Center', category: 'Food', emoji: '🍕', location: 'Student Center, Room 120', timeRemaining: '20 mins left', endingSoon: true, color: 'bg-orange-100 text-orange-600' },
  { id: '2', title: 'Robotics Club T-Shirts', category: 'Merch', emoji: '👕', location: 'Engineering Bldg, Lobby', timeRemaining: '2 hours left', endingSoon: false, color: 'bg-blue-100 text-blue-600' },
  { id: '3', title: 'Free Coffee — Lincoln Park', category: 'Drink', emoji: '☕', location: 'Quad (Near Library)', timeRemaining: '45 mins left', endingSoon: true, color: 'bg-amber-100 text-amber-700' },
  { id: '4', title: 'Game Night Snacks', category: 'Food', emoji: '🥨', location: 'SAC 2nd Floor', timeRemaining: '3 hours left', endingSoon: false, color: 'bg-orange-100 text-orange-600' },
  { id: '5', title: 'Engineering Dept Merch Drop', category: 'Merch', emoji: '🎒', location: 'Engineering Annex', timeRemaining: '1 hour left', endingSoon: false, color: 'bg-blue-100 text-blue-600' },
  { id: '6', title: 'Free Donuts in SAC', category: 'Food', emoji: '🍩', location: 'SAC Atrium', timeRemaining: '15 mins left', endingSoon: true, color: 'bg-pink-100 text-pink-600' },
  { id: '7', title: 'CSC Study Snacks', category: 'Food', emoji: '🍎', location: 'CS Lab 3', timeRemaining: '4 hours left', endingSoon: false, color: 'bg-red-100 text-red-600' },
  { id: '8', title: 'Econ Club Happy Hour', category: 'Drink', emoji: '🥤', location: 'Business School Lounge', timeRemaining: '1.5 hours left', endingSoon: false, color: 'bg-purple-100 text-purple-600' },
  { id: '9', title: 'Design Dept Stickers', category: 'Merch', emoji: '🎨', location: 'Art Building', timeRemaining: '5 hours left', endingSoon: false, color: 'bg-green-100 text-green-600' },
];

const CATEGORIES = [
  { name: 'All', emoji: '✨', active: true },
  { name: 'Food', emoji: '🍕', active: false },
  { name: 'Drink', emoji: '☕', active: false },
  { name: 'Merch', emoji: '👕', active: false },
];

export function SidebarGrid() {
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-screen w-full bg-white text-[#262626] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] border-r border-gray-200 px-3 pt-8 pb-4 h-full shrink-0">
        <div className="px-3 mb-10 flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#0095f6] to-purple-600 bg-clip-text text-transparent">FreeStuff</span>
          <span className="text-xl">🎁</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <a href="#" className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 font-semibold transition-colors group">
            <Home className="w-6 h-6 group-hover:scale-105 transition-transform" />
            <span>Browse</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 font-medium transition-colors group">
            <Search className="w-6 h-6 group-hover:scale-105 transition-transform" />
            <span>Search</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 font-medium transition-colors group">
            <Bookmark className="w-6 h-6 group-hover:scale-105 transition-transform" />
            <span>Saved</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 font-medium transition-colors group">
            <User className="w-6 h-6 group-hover:scale-105 transition-transform" />
            <span>Profile</span>
          </a>
        </nav>
        
        <div className="mt-auto space-y-2">
          <Button className="w-full justify-start gap-3 bg-[#0095f6] hover:bg-blue-600 text-white rounded-lg py-6 shadow-sm">
            <PlusSquare className="w-5 h-5" />
            <span className="font-semibold text-base">Post Giveaway</span>
          </Button>
          <a href="#" className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 font-medium transition-colors group text-gray-600">
            <Menu className="w-6 h-6" />
            <span>More</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Section */}
        <header className="px-4 md:px-8 pt-8 pb-6 shrink-0 border-b border-gray-100">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
            What's free right now 🎁
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search giveaways, locations..." 
                className="pl-10 bg-gray-50 border-transparent focus-visible:ring-[#0095f6] focus-visible:border-transparent rounded-xl h-11"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                    cat.active 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Grid Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-[2px] bg-gray-200 border border-gray-200">
              {DEMO_LISTINGS.map((listing) => (
                <div 
                  key={listing.id} 
                  className="group relative aspect-square bg-gray-50 overflow-hidden cursor-pointer flex items-center justify-center"
                >
                  {/* Big Emoji Background */}
                  <div className="text-[5rem] md:text-[8rem] opacity-80 group-hover:scale-110 transition-transform duration-500 ease-out">
                    {listing.emoji}
                  </div>
                  
                  {/* Urgency Badge (always visible if applicable) */}
                  {listing.endingSoon && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 flex items-center gap-1 text-xs shadow-md">
                        🔥 Ending Soon
                      </Badge>
                    </div>
                  )}

                  {/* Category Pill */}
                  <div className="absolute top-3 right-3 z-10">
                     <span className={`text-xs px-2 py-1 rounded-md font-semibold shadow-sm ${listing.color}`}>
                       {listing.category}
                     </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4 md:p-6 text-white">
                    <button 
                      onClick={(e) => toggleSave(listing.id, e)}
                      className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
                    >
                      <Bookmark 
                        className={`w-5 h-5 ${saved[listing.id] ? 'fill-white text-white' : 'text-white'}`} 
                      />
                    </button>
                    
                    <h3 className="text-lg md:text-xl font-bold leading-tight mb-3 line-clamp-2">
                      {listing.title}
                    </h3>
                    
                    <div className="space-y-2 text-sm md:text-base text-gray-200 font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0 text-gray-300" />
                        <span className="truncate">{listing.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 shrink-0 text-gray-300" />
                        <span>{listing.timeRemaining}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center text-gray-400 text-sm font-medium pb-8">
              Check back later for more free stuff!
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
