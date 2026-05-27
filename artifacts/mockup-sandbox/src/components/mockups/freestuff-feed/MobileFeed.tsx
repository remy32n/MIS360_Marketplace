import React, { useState } from "react";
import { Search, Heart, MapPin, Clock, Home, Bookmark, User, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "food", label: "Food", emoji: "🍕" },
  { id: "drinks", label: "Drinks", emoji: "🍺" },
  { id: "merch", label: "Merch", emoji: "👕" },
  { id: "events", label: "Events", emoji: "🎉" },
  { id: "supplies", label: "Supplies", emoji: "📚" },
];

const FEED_DATA = [
  {
    id: 1,
    title: "Free Pizza at the Student Center",
    org: "Student Government Association",
    location: "Student Center Rm 120",
    timeLeft: "2 hours left",
    category: "food",
    emoji: "🍕",
    imageColor: "bg-orange-100",
    saved: false,
    likes: 42,
  },
  {
    id: 2,
    title: "Robotics Club T-Shirts",
    org: "DePaul Robotics",
    location: "CDM Building Lobby",
    timeLeft: "45 mins left",
    category: "merch",
    emoji: "👕",
    imageColor: "bg-blue-100",
    saved: true,
    likes: 128,
  },
  {
    id: 3,
    title: "Free Coffee — Lincoln Park",
    org: "Campus Ministry",
    location: "Quad Tent",
    timeLeft: "3 hours left",
    category: "drinks",
    emoji: "☕️",
    imageColor: "bg-stone-200",
    saved: false,
    likes: 89,
  },
  {
    id: 4,
    title: "Game Night Snacks",
    org: "Esports DePaul",
    location: "Loop Campus 11th Floor",
    timeLeft: "Ending soon",
    category: "food",
    emoji: "🥨",
    imageColor: "bg-purple-100",
    saved: false,
    likes: 56,
  },
  {
    id: 5,
    title: "Engineering Dept Merch Drop",
    org: "College of Computing",
    location: "Daley Building",
    timeLeft: "5 hours left",
    category: "merch",
    emoji: "🎒",
    imageColor: "bg-teal-100",
    saved: false,
    likes: 210,
  },
];

export function MobileFeed() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [savedItems, setSavedItems] = useState<number[]>([2]);

  const toggleSave = (id: number) => {
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[100dvh] bg-white font-sans text-[#0a0a0a] pb-[env(safe-area-inset-bottom)] sm:max-w-md sm:mx-auto sm:border-x sm:border-gray-100 sm:shadow-sm relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "System-ui, -apple-system, sans-serif" }}>
            FreeCampus
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-1 hover:opacity-70 transition-opacity">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Category Scroll */}
        <div className="flex overflow-x-auto px-4 py-3 gap-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === cat.id
                  ? "bg-[#0a0a0a] text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              )}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Feed */}
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        <div className="flex flex-col gap-6 pt-2 pb-6">
          {FEED_DATA.filter(
            (item) => activeCategory === "all" || item.category === activeCategory
          ).map((item) => (
            <article key={item.id} className="flex flex-col bg-white">
              {/* Card Image Area */}
              <div className="px-3">
                <div 
                  className={cn(
                    "w-full aspect-[4/5] rounded-[12px] relative flex flex-col items-center justify-center overflow-hidden",
                    item.imageColor
                  )}
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
                >
                  <span className="text-8xl drop-shadow-sm">{item.emoji}</span>
                  
                  {/* Timer Badge Overlay */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">{item.timeLeft}</span>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="px-4 pt-3 pb-2 flex flex-col gap-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-[15px] leading-tight text-[#0a0a0a]">
                      {item.title}
                    </h2>
                    <p className="text-[13px] font-medium text-gray-500 mt-0.5">
                      {item.org}
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleSave(item.id)}
                    className="p-1 -mr-1 hover:opacity-70 active:scale-95 transition-all"
                  >
                    <Heart 
                      className={cn(
                        "w-6 h-6 transition-colors", 
                        savedItems.includes(item.id) ? "fill-[#ff3040] text-[#ff3040]" : "text-[#0a0a0a]"
                      )} 
                    />
                  </button>
                </div>
                
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[13px] text-gray-600">{item.location}</span>
                </div>

                <div className="mt-1">
                  <span className="text-[13px] font-semibold text-[#0a0a0a]">{item.likes} saves</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 w-full sm:max-w-md bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)] z-50">
        <div className="flex justify-around items-center h-12 px-2">
          <button className="p-2 flex flex-col items-center justify-center text-[#0a0a0a]">
            <Home className="w-[26px] h-[26px] fill-current" />
          </button>
          <button className="p-2 flex flex-col items-center justify-center text-gray-400 hover:text-[#0a0a0a] transition-colors">
            <Search className="w-[26px] h-[26px]" />
          </button>
          <button className="p-2 flex flex-col items-center justify-center text-gray-400 hover:text-[#0a0a0a] transition-colors">
            <PlusSquare className="w-[26px] h-[26px]" />
          </button>
          <button className="p-2 flex flex-col items-center justify-center text-gray-400 hover:text-[#0a0a0a] transition-colors">
            <Bookmark className="w-[26px] h-[26px]" />
          </button>
          <button className="p-2 flex flex-col items-center justify-center text-gray-400 hover:text-[#0a0a0a] transition-colors">
            <User className="w-[26px] h-[26px]" />
          </button>
        </div>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
