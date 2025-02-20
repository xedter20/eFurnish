import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Edit2, Trash2, ExternalLink } from "lucide-react";
import ProductUpdateModal from "../Modals/ProductUpdateModal/ProductUpdateModal";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { formatPrice } from "../../utils/formatPrice";

const ProductListAdmin = ({
  product,
  products,
  refetch,
  setProducts,
  setRefetch,
}) => {
  const { user } = useAuth();
  const { axiosSecure } = useAxiosSecure();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // delete a product
  const handleDeleteProduct = async (id) => {
    try {
      const res = await axiosSecure.delete(`/admin/products/${id}`, {
        params: { userEmail: user?.email },
      });
      if (res.data.deletedCount > 0) {
        toast.success("Product deleted successfully");
        const updatedProducts = products.filter(
          (product) => product._id !== id,
        );
        setProducts(updatedProducts);
        setDeleteModalOpen(false);
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Failed to delete product");
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="group hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-6 p-4">
        {/* Product Image */}
        <div className="relative w-24 h-24 rounded-lg border border-gray-200 overflow-hidden">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <Link
            to={`/products/${product._id}`}
            className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            <ExternalLink size={20} className="text-gray-700" />
          </Link>
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <Link
            to={`/products/${product._id}`}
            className="text-lg font-medium text-gray-900 hover:text-base transition-colors"
          >
            {product.title}
          </Link>
          {product.sub_title && (
            <p className="text-sm text-gray-500 mt-1">
              {product.sub_title}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Price:</span>
              <span className="text-sm font-medium text-gray-900">
                ₱{formatPrice(product.price.original)}
              </span>
            </div>
            {product.price?.discount_percent > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Discount:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {product.price.discount_percent}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 
              text-gray-600 hover:bg-gray-50 hover:text-base transition-colors"
          >
            <Edit2 size={16} />
            <span className="text-sm font-medium">Edit</span>
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 
              text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            <span className="text-sm font-medium">Delete</span>
          </button>
        </div>
      </div>

      {/* Update Modal */}
      <ProductUpdateModal
        product={product}
        refetch={refetch}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        setRefetch={setRefetch}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Product
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "{product.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 
                  rounded-lg border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(product._id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 
                  hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListAdmin;
