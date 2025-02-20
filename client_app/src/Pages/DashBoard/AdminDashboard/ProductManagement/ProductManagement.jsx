import axios from "axios";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { scrollToTop } from "../../../../utils/scrollUtils";
import Pagination from "../../../../components/Pagination/Pagination";
import ProductListAdmin from "../../../../components/ProductListAdmin/ProductListAdmin";
import { Package, Plus, SortAsc, SortDesc } from "lucide-react";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [refetch, setRefetch] = useState(false);
  const [sortValue, setSortValue] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // products pagination start index and end index
  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;

  // previous and next button disable status
  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;

  // items to display
  const itemsToDisplay = products.slice(startIndex, endIndex);

  // Products sorting function
  const handleSort = (e) => {
    setSortValue(e.target.value);
  };

  useEffect(() => {
    axios
      .get(`/products?sortBy=${sortValue}`)
      .then((res) => {
        setProducts(res.data);
        setTotalPages(Math.ceil(res.data.length / 5));
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, [refetch, sortValue]);

  return (
    <div className="p-6 space-y-6">
      <Helmet>
        <title>Manage Products - EFurnish</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-base/5 rounded-xl">
            <Package className="w-6 h-6 text-base" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500">Manage your product inventory</p>
          </div>
        </div>

        <Link
          to="/dashboard/add-product"
          className="inline-flex items-center gap-2 px-4 py-2 bg-base text-white rounded-lg 
            hover:bg-base-dark transition-colors duration-200"
        >
          <Plus size={20} />
          <span className="font-medium">Add Product</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Total Products:
            </span>
            <span className="text-sm font-medium text-base">
              {products.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Sort by:</span>
            <select
              onChange={handleSort}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 
                bg-white focus:outline-none focus:ring-2 focus:ring-base/20"
            >
              <option value="desc">Latest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>
        </div>

        {/* Products List */}
        <div className="divide-y divide-gray-100">
          {itemsToDisplay && itemsToDisplay.length > 0 ? (
            itemsToDisplay.map((product) => (
              <ProductListAdmin
                key={product._id}
                product={product}
                products={products}
                refetch={refetch}
                setProducts={setProducts}
                setRefetch={setRefetch}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base/5 flex items-center justify-center">
                <Package className="w-8 h-8 text-base" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No Products Added
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Get started by adding your first product. Click the "Add Product" button above
                to create a new product listing.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {itemsToDisplay.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              prevDisabled={prevDisabled}
              nextDisabled={nextDisabled}
              handlePrevClick={() => {
                scrollToTop();
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              handleNextClick={() => {
                scrollToTop();
                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
