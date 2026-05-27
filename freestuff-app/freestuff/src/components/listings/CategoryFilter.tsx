import React from 'react';
import { CATEGORY_EMOJI } from '../../utils/formatters';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const categories = ['ALL', 'FOOD', 'DRINKS', 'APPAREL', 'SUPPLIES', 'OTHER'];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
          data-testid={`filter-${category.toLowerCase()}`}
        >
          {category === 'ALL' ? 'All Items' : `${CATEGORY_EMOJI[category]} ${category.charAt(0) + category.slice(1).toLowerCase()}`}
        </button>
      ))}
    </div>
  );
}
