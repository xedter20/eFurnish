import { useEffect } from "react";
import Card from "../../../../components/Cards/Card/Card";
import { scrollToTop } from "../../../../utils/scrollUtils";
import CardList from "../../../../components/Cards/CardList/CardList";
import SkeletonLoader from "../../../../components/Loaders/SkeletonLoader/SkeletonLoader";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

const ProductsPagination = ({
  currentPage,
  endIndex,
  gridView,
  itemsPerPage,
  loading,
  sortedProducts,
  startIndex,
  totalPages,
  setCurrentPage,
  setTotalPages,
}) => {
  // previous and next button disable status
  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;

  // items to display
  const itemsToDisplay = sortedProducts.slice(startIndex, endIndex);

  // page change by click on page number
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    scrollToTop();
  };

  // previous page button
  const handlePrevClick = () => {
    scrollToTop();
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // next page button
  const handleNextClick = () => {
    scrollToTop();
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // render page num buttons
  const renderPageButtons = () => {
    const buttons = [];
    let startIndex, endIndex;

    if (currentPage <= 2) {
      startIndex = 1;
      endIndex = Math.min(3, totalPages);
    } else {
      startIndex = Math.max(1, currentPage - 1);
      endIndex = Math.min(totalPages, currentPage + 1);

      if (currentPage >= totalPages - 1) {
        startIndex = Math.max(1, totalPages - 2);
        endIndex = totalPages;
      }
    }

    for (let i = startIndex; i <= endIndex; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={i === currentPage}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
            ${i === currentPage
              ? "bg-[#BA8A5B] text-white shadow-md"
              : "bg-white hover:bg-gray-100 text-gray-700"}`}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  useEffect(() => {
    scrollToTop();
    setTotalPages(Math.ceil(sortedProducts.length / itemsPerPage));
  }, [itemsPerPage, currentPage]);

  return (
    <section className="px-6 py- bg-[#F8F9FA]">
      {/* Products Grid */}
      {gridView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading && <SkeletonLoader />}
          {!loading &&
            itemsToDisplay &&
            itemsToDisplay.length > 0 &&
            itemsToDisplay.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Card
                  product={product}
                  className="flex flex-col"
                >
                  {/* Product Image */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* Category */}
                    <p className="text-xs text-gray-500 mb-2">
                      {product.category}
                    </p>

                    {/* Title */}
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
                      {product.title}
                    </h3>

                    {/* Price and Stock Status */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-[#BA8A5B]">
                        ₱{product.price}
                      </span>
                      <span className={`
                        text-xs px-2 py-1 rounded-full
                        ${product.stock > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'}
                      `}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      className={`
                        w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium
                        ${product.stock > 0
                          ? 'bg-[#BA8A5B] text-white hover:bg-[#a67b4d]'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
                        transition-colors duration-200
                      `}
                      disabled={!product.stock}
                    >
                      <ShoppingCart size={16} />
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </Card>
              </div>
            ))}
        </div>
      ) : (
        <div className="space-y-4">
          {itemsToDisplay?.map((product) => (
            <div key={product._id} className="bg-white rounded-xl p-4 hover:shadow-lg transition-all duration-300">
              <CardList product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-12 flex items-center justify-center gap-2">
        {currentPage > 1 && (
          <button
            onClick={handlePrevClick}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div className="flex gap-2">
          {renderPageButtons()}
        </div>

        {currentPage < totalPages && (
          <button
            onClick={handleNextClick}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    </section>
  );
};

export default ProductsPagination;
