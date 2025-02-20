import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { X, Package } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ProductUpdateModal = ({
  product,
  modalOpen,
  refetch,
  setModalOpen,
  setRefetch,
}) => {
  const { user } = useAuth();
  const { axiosSecure } = useAxiosSecure();
  const { register, handleSubmit, reset } = useForm();

  // update a product info
  const handleProductUpdate = async (updatedProduct) => {
    try {
      const res = await axiosSecure.put(
        `/admin/products/${product._id}`,
        updatedProduct,
        { params: { userEmail: user?.email } },
      );
      if (res.data.modifiedCount > 0) {
        reset();
        setModalOpen(false);
        toast.success("Product updated successfully!");
        setRefetch(!refetch);
      }
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Failed to update product");
    }
  };

  // Form Submit handler
  const onSubmit = (data) => {
    const updatedProduct = {
      ...product,
      title: data.title,
      sub_title: data.sub_title,
      price: {
        original: parseFloat(data.price),
      },
      category: data.category
    };

    if (data.discount > 0) {
      const discounted =
        parseFloat(data.price) -
        (parseFloat(data.price) * parseInt(data.discount)) / 100;

      updatedProduct.price.discount_percent = parseInt(data.discount);
      updatedProduct.price.discounted = parseFloat(discounted.toFixed(2));
    }

    delete updatedProduct._id;
    handleProductUpdate(updatedProduct);
  };

  return (
    <Dialog
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/50" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl rounded-xl bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-base/5 rounded-xl">
                  <Package className="w-5 h-5 text-base" />
                </div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Update Product
                </DialogTitle>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Title and Subtitle */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    defaultValue={product.title}
                    {...register("title")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-base/20 focus:border-base"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    defaultValue={product.sub_title}
                    {...register("sub_title")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-base/20 focus:border-base"
                  />
                </div> */}
              </div>

              {/* Price and Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price <span className="text-xs text-gray-500">PHP</span>
                  </label>
                  <input
                    type="number"
                    defaultValue={product.price.original}
                    {...register("price")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-base/20 focus:border-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount <span className="text-xs text-gray-500">%</span>
                  </label>
                  <input
                    type="number"
                    defaultValue={product.price?.discount_percent || 0}
                    {...register("discount")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-base/20 focus:border-base"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  defaultValue={product.category}
                  {...register("category")}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-base/20 focus:border-base"
                >
                  <option value="chairs">Chairs</option>
                  <option value="tables">Tables</option>
                  <option value="sofas">Sofas</option>
                  <option value="cabinets">Cabinets</option>
                  <option value="beds">Beds</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 
                    rounded-lg border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm font-medium text-white bg-base 
                    hover:bg-base-dark rounded-lg transition-colors"
                >
                  Update Product
                </motion.button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductUpdateModal;
