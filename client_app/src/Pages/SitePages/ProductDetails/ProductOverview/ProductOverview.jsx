import { useRef, useState, useEffect } from "react";
import { Rating } from "@smastrom/react-rating";
import { motion } from "framer-motion";
import { AiFillTwitterCircle } from "react-icons/ai";
import { BsFacebook, BsHeart, BsHeartFill, BsLinkedin } from "react-icons/bs";
import LoginModal from "../../../../components/Modals/LoginModal/LoginModal";
import { formatPrice } from "../../../../utils/formatPrice";
import { calculateAvgRating } from "../../../../utils/calculateAvgRating";
import useAuth from "../../../../hooks/useAuth";
import useCart from "../../../../hooks/useCart";
import useFavourite from "../../../../hooks/useFavourite";
import { useDropzone } from 'react-dropzone';

import * as fabric from 'fabric'; // Ensure you're using Fabric.js v6



const sizes = ["l", "xl", "xs"];
const colors = ["#816dfa", "black", "#b88e2f"];
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
const ProductOverview = ({ product, reviews }) => {
  const { axiosSecure } = useAxiosSecure();
  const { _id, title, price, thumbnail, gallery } = product;
  const { user } = useAuth();
  const { handleCartItemSave } = useCart();
  const { addToFavourite, favouriteItems, deleteFavouriteItem } =
    useFavourite();
  const [mainImage, setMainImage] = useState(thumbnail);
  const [size, setSize] = useState("l");
  const [color, setColor] = useState('transparent');
  const [quantity, setQuantity] = useState(1);
  const [isOpen, setIsOpen] = useState(false); // login modal state
  const [files, setFiles] = useState([]); // State to store uploaded files
  const isFavourite = favouriteItems.some((item) => item.product_id === _id);

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Add a new item to cart
  const [customFiles, setCustomFiles] = useState([]);

  const onDrop = (acceptedFiles) => {
    // Handle accepted files (only images)
    const newFiles = acceptedFiles.map((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Create an image element to display the preview
        const imgElement = document.createElement('img');
        imgElement.src = reader.result;
        imgElement.alt = file.name;
        imgElement.className = 'w-32 h-auto rounded-lg shadow-md'; // Tailwind classes for styling

        // Append the image preview to the container
        document.getElementById('imagePreviewContainer').appendChild(imgElement);
      };
      reader.readAsDataURL(file);
      return { file }; // Store both file and preview URL
    });
    setFiles((prevFiles) => [...prevFiles, ...newFiles]); // Update state with new files
  };

  const submitCartItem = async () => {
    if (!user) {
      return setIsOpen(true);
    }

    const item = {
      user_email: user.email,
      product_id: _id,
      title,
      price: price.discounted ? price.discounted : price.original,
      thumbnail,
      quantity,
      size,
      color,
      customizeDesignImages: files
    };



    // save new item or update quantity of item if item exists in the cart
    let cartId = await handleCartItemSave(item);


    const formData = new FormData();
    formData.append('cartId', cartId); //
    files.forEach((file) => {
      formData.append('files', file.file); // Append file to FormData
    });
    console.log({ formData })
    await axiosSecure
      .post("/users/cart/create_custom_design", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        params: { userEmail: user.email }
      },)
      .then((res) => {



      })
    console.log({ cartId })
  };

  // const toggleFavourite = () => {
  //   if (!user) {
  //     return setIsOpen(true);
  //   }
  //   if (!isFavourite) {
  //     return addToFavourite(_id, title, price, thumbnail);
  //   }
  //   deleteFavouriteItem(_id, user.email);
  // };



  const canvasRef = useRef(null); // Reference to the Fabric.js canvas
  const [canvas, setCanvas] = useState(null); // State to store the Fabric.js canvas instance
  const [basket, setBasket] = useState(null); // State to store the basket image object

  const [tshirt, setTshirt] = useState(null); // Store the T-shirt image object


  // Initialize Fabric.js Canvas
  useEffect(() => {
    // const fabricCanvas = new fabric.Canvas('tshirtCanvas');
    // setCanvas(fabricCanvas);
    // // Function to resize the canvas to match the container size
    // const resizeCanvas = () => {
    //   const container = canvasRef.current;
    //   const containerWidth = container.offsetWidth;
    //   const containerHeight = container.offsetHeight;

    //   // Set canvas size to container's dimensions
    //   fabricCanvas.setWidth(containerWidth);
    //   fabricCanvas.setHeight(containerHeight);

    //   // Redraw canvas content if needed
    //   fabricCanvas.renderAll();
    // };

    // // Initial resize on load
    // resizeCanvas();
    // // Resize the canvas when the window size changes
    // window.addEventListener('resize', resizeCanvas);

    // fabric.Image.fromURL(mainImage, (img) => {
    //   img.crossOrigin = 'anonymous'; // Important to avoid CORS issues
    //   img.set({

    //     // right: 0,
    //     // top: 50,
    //     // scaleX: 3,
    //     // scaleY: 3,
    //   });
    //   fabricCanvas.add(img);
    //   setTshirt(img); // Store the T-shirt image object
    // }, { crossOrigin: 'anonymous' });

    // return () => {

    //   window.removeEventListener('resize', resizeCanvas);
    //   fabricCanvas.dispose(); // Dispose Fabric.js instance
    // };
  }, [mainImage,]);
  // Function to change T-shirt color using a filter

  const handleColorChange = (event) => {
    const selectedColor = event.target.value;
    setColor(selectedColor);

    // If there's a T-shirt image, set its background color
    if (tshirt) {

      console.log({ color })
      tshirt.filters = [
        new fabric.Image.filters.BlendColor({
          color: color,
          mode: 'multiply', // You can experiment with other blend modes like 'add', 'subtract'
          alpha: 0.5,       // Adjust transparency (0.0 to 1.0)
        }),
      ];
      tshirt.applyFilters(); // Apply the filter
      canvas.renderAll(); // Re-render canvas to display the new color
    }
  };


  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': [], // Accept only image files
    },
  });
  return (
    <>


      <div className="justify-between pb-16 pt-8 md:flex md:gap-6 lg:gap-10 xl:gap-20">
        {/* gallery container */}
        <div className="flex flex-col-reverse gap-8 md:justify-end lg:flex-row lg:gap-x-4">
          {/* thumbnail */}
          {/* <canvas id="tshirtCanvas" ref={canvasRef} width="1800" height="500"></canvas> */}
          <div className="flex justify-evenly lg:flex-col lg:justify-start lg:gap-8">
            {gallery &&
              gallery.length > 0 &&
              gallery.map((image) => {
                return (
                  <img
                    key={image}
                    onClick={() => setMainImage(image)}
                    onMouseEnter={() => setMainImage(image)}
                    className={`size-16 rounded-[10px] border-[3px] object-cover object-center transition-all duration-150 ease-in sm:size-20 md:h-20 md:w-[76px] ${image === mainImage ? "border-primary" : "border-transparent"}`}
                    src={image}
                    alt="shop image"
                    loading="lazy"
                  />
                );
              })}
          </div>
          {/* main image */}


          <div className="">

            <div className="w-full h-screen flex flex-col items-center">
              {/* Color Picker */}
              {/* <div className="mb-4">
                <label className="mr-2">Customize color: </label>
                <input
                  type="color"
                  value={color}
                  onChange={handleColorChange}
                />
              </div> */}

              {/* Canvas Container */}
              <div ref={canvasRef} className="w-full h-full">
                <canvas id="tshirtCanvas" className="w-full h-full"></canvas>
              </div>
            </div>
            {/* <div ref={canvasRef} className="w-full h-screen">
              <canvas id="tshirtCanvas" className="w-full h-full"></canvas>
            </div> */}
            {/* <img
              className="h-96 w-full rounded-[10px] object-cover object-center sm:h-[450px] md:h-[500px] md:max-h-[500px] md:w-[420px] md:max-w-[420px]"
              src={mainImage}
              alt={`image of ${title}`}
              loading="lazy"
            /> */}
          </div>
        </div>

        {/* product info container */}
        <div className="mt-2 flex-1">
          <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl lg:font-normal xl:text-[42px]">
            {title}
          </h1>
          <p className="text-cadetGray mt-4 text-xl font-medium sm:text-2xl">
            {" "}
            {price.discounted
              ? formatPrice(price.discounted)
              : formatPrice(price.original)}
          </p>
          {/* <div className="mb-4 mt-3 flex flex-wrap items-center gap-2 lg:gap-5">
            <Rating
              style={{ maxWidth: 110 }}
              value={calculateAvgRating(reviews)}
              readOnly
            />
            <div className="bg-cadetGray h-6 w-0.5 lg:h-8"></div>
            <p className="text-cadetGray text-sm">
              {reviews.length} customer review
            </p>
          </div> */}

          {/* <p className="mb-6 w-full max-w-md text-sm">
            {product.overview ? (
              product.overview
            ) : (
              <>
                Setting the bar as one of the loudest speakers in its class, the
                Kilburn is a compact, stout-hearted hero with a well-balanced
                audio which boasts a clear midrange and extended highs for a
                sound.
              </>
            )}
          </p> */}
          {/* Size Selection Buttons */}
          {/* <div className="text-sm">
            <p className="text-cadetGray">Size</p>
            <div className="mt-3 flex gap-4">
              {sizes.map((itemSize, i) => (
                <button
                  onClick={() => setSize(itemSize)}
                  key={i}
                  className={`size-8 rounded-md uppercase ${size === itemSize ? "bg-primary text-white" : "bg-cream"}`}
                >
                  {itemSize}
                </button>
              ))}
            </div>
          </div> */}
          {/* Color Selection Buttons */}
          <div className="mt-5 text-sm">
            {/* <p className="text-cadetGray">Color</p> */}
            <div className="mt-3 flex gap-4">
              <div className="mb-4">
                <label className="mr-2">Customize color: </label>
                <input
                  type="color"

                  value={color === 'transparent' ? '#ffffff' : color} // Use white for the input when transparent
                  onChange={handleColorChange}
                />
                <button
                  onClick={() => {
                    setColor('transparent');


                    // If there's a T-shirt image, set its background color
                    if (tshirt) {
                      const fabricCanvas = new fabric.Canvas('tshirtCanvas');
                      fabric.Image.fromURL(mainImage, (img) => {
                        img.crossOrigin = 'anonymous'; // Important to avoid CORS issues
                        img.set({

                          // right: 0,
                          // top: 50,
                          // scaleX: 3,
                          // scaleY: 3,
                        });
                        fabricCanvas.add(img);
                        setTshirt(img); // Store the T-shirt image object
                      }, { crossOrigin: 'anonymous' });

                      // tshirt.filters = [
                      //   new fabric.Image.filters.BlendColor({
                      //     color: color,
                      //     mode: 'multiply', // You can experiment with other blend modes like 'add', 'subtract'
                      //     alpha: 0.5,       // Adjust transparency (0.0 to 1.0)
                      //   }),
                      // ];
                      // tshirt.applyFilters(); // Apply the filter
                      // canvas.renderAll(); // Re-render canvas to display the new color
                    }
                  }}
                  className="mt-4 p-1 bg-gray-500 text-white rounded hover:bg-red-600 ml-4"
                >
                  Reset Color
                </button>
              </div>
              {/* {colors.map((itemColor, i) => (
                <div
                  key={i}
                  onClick={() => setColor(itemColor)}
                  className={`size-8 cursor-pointer rounded-full ${itemColor === color && "border-4 bg-slate-900"}`}
                  style={{ backgroundColor: itemColor }}
                ></div>
              ))} */}
            </div>
          </div>

          {/* buttons */}
          <div className="mb-16 mt-8 flex flex-col flex-wrap gap-4 lg:flex-row">
            {/* Quantity selection button */}
            <div className="border-cadetGray inline-flex w-full flex-1 items-center justify-center gap-2 rounded-[10px] border p-2 lg:w-1/2 lg:p-3 xl:max-w-[120px] xl:p-5">
              <button
                onClick={decreaseQuantity}
                className="flex size-5 items-center justify-center rounded-full transition-all hover:bg-gray-300"
              >
                -
              </button>
              <p>{quantity}</p>
              <button
                onClick={increaseQuantity}
                className="flex size-5 items-center justify-center rounded-full transition-all hover:bg-gray-300"
              >
                +
              </button>
            </div>
            {/* Add to cart button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={submitCartItem}
              className="flex flex-1 items-center justify-center rounded-[10px] border border-black py-2 transition-colors hover:border-transparent hover:bg-primary hover:text-white md:w-full md:px-12 lg:w-1/2 lg:px-6 lg:text-lg xl:max-w-[217px] xl:px-2 xl:text-xl"
            >
              Add To Cart
            </motion.button>
            {/* Compare button */}
            {/* <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavourite}
              className="group flex items-center justify-center gap-2.5 rounded-[10px] border border-black py-2 transition-colors hover:border-transparent hover:bg-primary hover:text-white md:w-full md:px-12 xl:max-w-[215px] xl:py-[14px]"
            >
              {isFavourite ? (
                <BsHeartFill className="text-red-600 group-hover:text-white" />
              ) : (
                <BsHeart />
              )}
              <span className="lg:text-lg xl:text-xl">Favourite</span>
            </motion.button> */}
          </div>


        </div>
        <div className="mt-2 flex-1">
          <div className="flex flex-col items-center">
            <div
              {...getRootProps({
                className: 'dropzone border-2 border-dashed border-blue-500 rounded-lg p-4 text-center cursor-pointer hover:bg-blue-50',
              })}
            >
              <input {...getInputProps()} />
              <p className="text-blue-500">Upload your customize design</p>
            </div>
            <div id="imagePreviewContainer" className="mt-4 grid grid-cols-2 gap-4"></div>
          </div>

        </div>

      </div>
      {/* Login Modal if user not available */}
      {isOpen && !user && <LoginModal isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  );
};

export default ProductOverview;
