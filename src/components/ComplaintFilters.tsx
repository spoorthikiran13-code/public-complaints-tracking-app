import React from 'react';
import { FilterState, IssueCategory } from '../types';
import { CATEGORY_DEFINITIONS, WARDS_LIST } from '../data/mockComplaints';
import { 
  Search, 
  X, 
  MapPin, 
  LayoutGrid, 
  List, 
  Map as MapIcon, 
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

interface ComplaintFiltersProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalFilteredCount: number;
}

export const ComplaintFilters: React.FC<ComplaintFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  totalFilteredCount,
}) => {
  const categories = Object.keys(CATEGORY_DEFINITIONS) as IssueCategory[];

  return (
    <div className="space-y-4">
      {/* Top row: Search and Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="complaints-search-input"
            type="text"
            placeholder="Search by ticket # (e.g. CMP-8491), keyword, street, or landmark..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Ward Selector, Sort By, and View Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ward filter */}
          <div className="relative">
            <select
              id="filter-ward-select"
              value={filters.ward}
              onChange={(e) => onFilterChange({ ward: e.target.value })}
              aria-label="Filter by Ward"
              className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
            >
              <option value="all">All City Wards</option>
              {WARDS_LIST.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              id="filter-sort-select"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
              aria-label="Sort Complaints"
              className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
            >
              <option value="newest">Latest Reported</option>
              <option value="upvotes">Most Citizen Votes</option>
              <option value="priority">Highest Urgency</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              id="view-mode-grid"
              type="button"
              onClick={() => onFilterChange({ viewMode: 'grid' })}
              title="Grid View"
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filters.viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-list"
              type="button"
              onClick={() => onFilterChange({ viewMode: 'list' })}
              title="Detailed List View"
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filters.viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              id="view-mode-map"
              type="button"
              onClick={() => onFilterChange({ viewMode: 'map' })}
              title="Geographic Map View"
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filters.viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills horizontal scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => onFilterChange({ category: 'all' })}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
            filters.category === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          All Categories
        </button>

        {categories.map((catKey) => {
          const def = CATEGORY_DEFINITIONS[catKey];
          const isSelected = filters.category === catKey;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => onFilterChange({ category: isSelected ? 'all' : catKey })}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <span>{def.label}</span>
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 shrink-0 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Results Count Line */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
        <div>
          Showing <span className="font-bold text-slate-900">{totalFilteredCount}</span> infrastructure reports
          {hasActiveFilters && ' (filtered)'}
        </div>
      </div>
    </div>
  );
};
