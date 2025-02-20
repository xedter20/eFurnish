import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
import categoryImg1 from "../../../../assets/images/home/category-1.webp";
import categoryImg2 from "../../../../assets/images/home/category-2.jpg";
import categoryImg3 from "../../../../assets/images/home/category-3.jpg";
import categoryImg4 from "../../../../assets/images/home/category-4.jpg";
const Categories = () => {

  const categories = [
    {
      title: 'Chairs',
      image: 'https://img.freepik.com/free-photo/vertical-shot-chair-with-net-chair-s-back-white-surface_181624-22545.jpg?t=st=1740006562~exp=1740010162~hmac=db7af9dd329041119956be5dcb5b394aa20b1abf38b9cfc77bfe98c56d018adb&w=1060', // Replace with actual image URL
      link: '/products?category=chairs',
    },
    {
      title: 'Tables',
      image: 'https://img.freepik.com/free-photo/side-view-cup-coffee-small-round-table-horizontal_176474-2487.jpg?t=st=1740006656~exp=1740010256~hmac=787d4d47736378949c04bda20ce975d7a93daae44b238842e90541ec3c3770d4&w=1380', // Replace with actual image URL
      link: '/products?category=tables',
    },
    {
      title: 'Sofas',
      image: 'https://img.freepik.com/free-photo/chic-mid-century-modern-luxury-aesthetics-living-room-with-gray-velvet-couch-blue-rug_53876-128133.jpg?t=st=1740006691~exp=1740010291~hmac=19d00560b09e3ebfad73ba43664a298ebabe8a0939159dfbb1afe17808b5a99e&w=1380', // Replace with actual image URL
      link: '/products?category=sofas',
    },
    {
      title: 'Cabinets',
      image: 'https://img.freepik.com/free-photo/3d-render-modern-home-office_1048-10248.jpg?t=st=1740006726~exp=1740010326~hmac=47ddd284f7a71b0f96b5d8566b17cc674cc50c1d404eb3d2028657d27e8c53d1&w=740', // Replace with actual image URL
      link: '/products?category=cabinets',
    },
  ];
  ;

  const CategoryCard = ({ image, title, link }) => {
    return (
      <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-lg shadow-lg">
        <img
          className="h-64 w-full object-cover"
          src={image}
          alt={title}
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 w-full bg-black/40 p-4 text-white">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <Link
            to={link}
            className="group mt-2 inline-flex items-center gap-1 border-b border-white pb-0.5"
          >
            Shop Now
            <BsArrowRight
              size={20}
              className="transition-transform duration-300 ease-in group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    );
  };
  return (
    <section className="px-[4%] text-[#333] md:px-[10%]">
      <h1 className="mt-14 text-center text-3xl font-bold">Categories</h1>
      <p className="text-center text-lg text-[#666] md:text-xl">
        Transform Your Space with Style – Explore Our Top Furniture Picks!
      </p>
      {/* cards container */}
      <hr className="mt-4 mb-4" />
      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            image={category.image}
            title={category.title}
            link={category.link}
          />
        ))}
      </div>
    </section>
  );
};

export default Categories;
