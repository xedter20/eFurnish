import { Grid, SortAsc, SortDesc, DollarSign, Search } from 'lucide-react';
import { useState } from 'react';

const SortView = ({
  endIndex,
  handleSort,
  sortedProducts,
  startIndex,
  setGridView,
  gridView,
  setItemsPerPage,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}


      {/* Sort and View Controls */}
      <div className="bg-accent rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Products Count */}
          <div className="flex items-center gap-2 text-sm text-gray-600">

          </div>

          <div className="flex items-center gap-4">
            {/* Sort Options */}
            <div className="">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search ..."
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
              text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-base/20
              focus:border-base transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      onSearch('');
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="sr-only">Clear search</span>
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="relative">
              <select
                onChange={handleSort}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-8 py-2 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-base/20 cursor-pointer"
              >
                <option value="desc">Latest</option>
                <option value="asc">Oldest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <SortAsc className="w-4 h-4 text-gray-400" />
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setGridView(true)}
                className={`p-2 rounded-md transition-colors ${gridView
                  ? 'bg-base text-white'
                  : 'text-gray-500 hover:text-base hover:bg-gray-100'
                  }`}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setGridView(false)}
                className={`p-2 rounded-md transition-colors ${!gridView
                  ? 'bg-base text-white'
                  : 'text-gray-500 hover:text-base hover:bg-gray-100'
                  }`}
                aria-label="List view"
              >
                <svg
                  className="w-[18px] h-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Items Per Page */}
            <div className="relative">
              <select
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-8 py-2 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-base/20 cursor-pointer"
              >
                <option value="12">12 per page</option>
                <option value="24">24 per page</option>
                <option value="36">36 per page</option>
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortView;
