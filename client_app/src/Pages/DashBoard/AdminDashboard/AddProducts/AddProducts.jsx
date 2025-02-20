import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Package, ArrowLeft, Info } from "lucide-react";
import AddImages from "./AddImages/AddImages";
import { uploadImagesToImgbb } from "../../../../utils/imageUpload";
import useAuth from "../../../../hooks/useAuth";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

const AddProducts = () => {
  const { user } = useAuth();
  const { axiosSecure } = useAxiosSecure();
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { is_new: false }
  });

  const addNewProduct = async (newProduct) => {
    try {
      const res = await axiosSecure.post("/admin/products", newProduct, {
        params: { userEmail: user?.email },
      });
      if (res.data.acknowledged && res.data.insertedId) {
        toast.success("New product added successfully!");
        navigate("/dashboard/products");
      } else {
        toast.error("Failed to add new product. Please try again.");
        reset();
      }
    } catch (err) {
      console.error("Error adding new product:", err);
      toast.error("Error adding new product. Please try again.");
      reset();
    }
  };

  const onSubmit = async (data) => {
    try {
      const uploadResults = await uploadImagesToImgbb(selectedImages);
      const uploadedImages = uploadResults.map((result) => result.url);
      const thumbnail = uploadedImages[0];
      const gallery = uploadedImages.slice(1);
      const tagsArray = data.tags.split(",");

      const newProduct = {
        category: data.category.toLowerCase(),
        title: data.title,
        sub_title: '',
        is_new: data.is_new === "true",
        tags: tagsArray,
        price: {
          original: parseFloat(data.originalPrice),
        },
        thumbnail,
        gallery,
        overview: data.overview,
      };

      if (data.discount_percent > 0) {
        const discounted =
          parseFloat(data.originalPrice) -
          (parseFloat(data.originalPrice) * parseInt(data.discount_percent)) / 100;
        newProduct.price.discount_percent = parseInt(data.discount_percent);
        newProduct.price.discounted = parseFloat(discounted.toFixed(2));
      }

      await addNewProduct(newProduct);
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Error submitting form. Please try again.");
      reset();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Helmet>
        <title>Add Product - EFurnish</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/products"
            className="p-2 rounded-xl bg-base/5 hover:bg-base/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-base" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Add Product</h1>
            <p className="text-sm text-gray-500">Create a new product listing</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-6">
        {/* General Information */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              General Information
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  id="title"
                  {...register("title", { required: true })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-base/20 focus:border-base"
                />
              </div>

              <div>
                <label htmlFor="overview" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="overview"
                  {...register("overview", { required: true })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-base/20 focus:border-base min-h-[120px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="col-span-12 lg:col-span-4">
          <AddImages
            register={register}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            imagePreviews={imagePreviews}
            setImagePreviews={setImagePreviews}
          />
        </div>

        {/* Pricing */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Pricing
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="text"
                    id="originalPrice"
                    {...register("originalPrice", { required: true })}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-base/20 focus:border-base"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="discount_percent" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  id="discount_percent"
                  {...register("discount_percent")}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-base/20 focus:border-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category & Tags */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Category & Tags
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
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


              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="tags"
                    {...register("tags", {
                      required: true,
                      pattern: {
                        value: /^(?!.*, )[A-Za-z0-9 ]+(?:,[A-Za-z0-9 ]+)*$/,
                        message: "Tags must be comma-separated without spaces.",
                      },
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-base/20 focus:border-base"
                    placeholder="chairs,tables,sofas"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 tooltip" data-tip="Comma-separated tags">
                    <Info size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="col-span-12 flex justify-end">
          <motion.button
            type="submit"
            className="px-6 py-2 bg-base text-white rounded-lg hover:bg-base-dark transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            Add Product
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;
