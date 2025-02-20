import { useEffect, useState } from "react";
import { useLoaderData, Link } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet";
import ProductOverview from "./ProductOverview/ProductOverview";
import { Star, ArrowLeft, ShoppingBag } from "lucide-react";
import LoginModal from "../../../components/Modals/LoginModal/LoginModal";
import AddToCartModal from "../../../components/Modals/AddToCartModal/AddToCartModal";
import useAuth from "../../../hooks/useAuth";
import useCart from "../../../hooks/useCart";
import { toast } from "react-hot-toast";

import { fabric } from "fabric";
const ProductDetails = () => {
  const product = useLoaderData();
  const { _id, title, category } = product;
  const [reviews, setReviews] = useState([]);
  const { user } = useAuth()
  const { handleCartItemSave } = useCart();

  console.log({ user })

  // Cart Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.thumbnail);

  // Customizer States
  const [canvas, setCanvas] = useState(null);
  const [color, setColor] = useState("#ffffff");

  // Handle Add to Cart
  const handleAddToCart = () => {

    console.log({ user })
    // if (!user) {
    //   return setIsOpen(true);
    // }

    try {
      // Create cart item
      const cartItem = {
        user_email: user.email,
        product_id: _id,
        title: title,
        price: product.price.discounted ? product.price.discounted : product.price.original,
        thumbnail: selectedImage,
        quantity: quantity,
        color: color !== '#ffffff' ? color : 'transparent',
        // customizeDesignImagesLinks: canvas ? [canvas.toDataURL()] : []
      };


      console.log({ cartItem })
      // Add to cart
      handleCartItemSave(cartItem);
      //  toast.success("Added to cart successfully!");

    } catch (error) {

      console.log(error)

    }

  };

  // Handle Quantity
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reviewsResponse = await axios.get(
          `/reviews`,
          {
            params: { product_id: _id },
          },
        );
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [_id]);

  // Calculate average rating
  const averageRating = reviews.length
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Initialize fabric canvas with proper dimensions
  useEffect(() => {
    // Get container width
    const container = document.querySelector('#canvasContainer');
    if (container) {
      const width = container.offsetWidth;
      const height = width; // Make it square

      const fabricCanvas = new fabric.Canvas("furnitureCanvas", {
        width: width,
        height: height,
        backgroundColor: '#f8f9fa'
      });

      setCanvas(fabricCanvas);

      // Load initial image
      fabric.Image.fromURL(selectedImage, (img) => {
        // Calculate dimensions to maintain aspect ratio
        const scale = Math.min(
          width / img.width,
          height / img.height
        );

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: width / 2,
          top: height / 2,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true
        });

        // Apply initial color filter
        img.filters = [new fabric.Image.filters.BlendColor({
          color: color,
          mode: 'tint',
          alpha: 0.5
        })];

        img.applyFilters();
        fabricCanvas.clear();
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
      });

      return () => fabricCanvas.dispose();
    }
  }, []); // Run only once on mount

  // Handle color changes
  const handleColorChange = (event) => setColor(event.target.value);

  // Update color filter
  useEffect(() => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.filters = [new fabric.Image.filters.BlendColor({
          color: color,
          mode: 'tint',
          alpha: 0.5
        })];
        activeObject.applyFilters();
        canvas.renderAll();
      }
    }
  }, [canvas, color]);

  // Reset customizations
  const handleReset = () => {
    if (canvas) {
      fabric.Image.fromURL(selectedImage, (img) => {
        const maxSize = 400;
        const scale = Math.min(
          maxSize / img.width,
          maxSize / img.height
        );

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: canvas.width / 2,
          top: canvas.height / 2,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true
        });

        canvas.clear();
        canvas.add(img);
        canvas.renderAll();
      });
    }
  };

  // Function to load image into canvas
  const loadImageToCanvas = (imageUrl) => {
    if (canvas) {
      const width = canvas.width;
      const height = canvas.height;

      fabric.Image.fromURL(imageUrl, (img) => {
        const scale = Math.min(
          width / img.width,
          height / img.height
        );

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: width / 2,
          top: height / 2,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true
        });

        img.filters = [new fabric.Image.filters.BlendColor({
          color: color,
          mode: 'tint',
          alpha: 0.5
        })];

        img.applyFilters();
        canvas.clear();
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' }); // Add crossOrigin handling
    }
  };

  // Update thumbnail click handler
  const handleThumbnailClick = (image) => {
    setSelectedImage(image);
    loadImageToCanvas(image);
  };

  // Load initial image when canvas is ready
  useEffect(() => {
    if (canvas && selectedImage) {
      loadImageToCanvas(selectedImage);
    }
  }, [canvas]);

  console.log({ product })
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{title} - EFurnish</title>
      </Helmet>

      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-base transition-colors"
          >
            <ArrowLeft size={16} />
            Back to list
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Image Gallery */}
            <div className="space-y-4 p-6">
              {/* Main Image */}
              <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-base text-white text-xs font-bold px-2 py-1 rounded">
                  {product.category}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-4">
                <button
                  onClick={() => handleThumbnailClick(product.thumbnail)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === product.thumbnail
                    ? 'border-base'
                    : 'border-transparent hover:border-base/50'
                    }`}
                >
                  <img
                    src={product.thumbnail}
                    alt={`${product.title} thumbnail`}
                    className="w-full h-full object-cover"
                  />
                </button>
                {product.gallery?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(image)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === image
                      ? 'border-base'
                      : 'border-transparent hover:border-base/50'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Image Navigation Dots (Mobile) */}
              <div className="flex justify-center gap-2 md:hidden">
                <button
                  onClick={() => setSelectedImage(product.thumbnail)}
                  className={`w-2 h-2 rounded-full transition-colors ${selectedImage === product.thumbnail
                    ? 'bg-base'
                    : 'bg-gray-300'
                    }`}
                />
                {product.gallery?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`w-2 h-2 rounded-full transition-colors ${selectedImage === image
                      ? 'bg-base'
                      : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="p-8 flex flex-col">
              {/* Category */}
              {/* <div className="text-xs text-gray-500 uppercase mb-2">
                {category}
              </div> */}

              {/* Title */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                {title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(averageRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {averageRating} ({reviews.length} reviews)
                </span>
              </div>

              {/* Description */}
              <div className="text-sm text-gray-600 mb-8">
                {product.overview}
              </div>

              {/* Price */}
              <div className="text-2xl font-semibold text-base mb-8">
                ₱{product.price.original}
              </div>

              {/* Add to Cart Section */}
              <div className="mt-2">
                <div className="flex items-center gap-4 mb-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={decreaseQuantity}
                      className="px-4 py-2 text-gray-500 hover:text-base"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button
                      onClick={increaseQuantity}
                      className="px-4 py-2 text-gray-500 hover:text-base"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-base text-white py-2 rounded-lg hover:bg-base-dark 
                      transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={20} />
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Customizer Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Customize Your Furniture
              </h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-base 
                  bg-gray-50 rounded-lg transition-colors"
              >
                Reset Changes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Canvas */}
              <div id="canvasContainer" className="bg-gray-50 rounded-lg p-4">
                <canvas
                  id="furnitureCanvas"
                  className="w-full rounded-lg shadow-sm"
                />
              </div>

              {/* Controls */}
              <div className="space-y-6">
                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apply Color Overlay
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={color}
                      onChange={handleColorChange}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">
                      Selected: {color}
                    </span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    How to Use:
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Click on the image to select it for editing</li>
                    <li>• Use color picker to apply a color overlay</li>
                    <li>• Drag corners to resize, rotate, or move the image</li>
                    <li>• Click "Reset Changes" to start over</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Customer Reviews
          </h2>
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isOpen && !user && (
        <LoginModal isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
    </div>
  );
};

export default ProductDetails;
