import { useNavigate } from "react-router-dom";

import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

function CarouselComponent({books, name}) {
  const baseUrl = process.env.PUBLIC_URL;
  const navigate = useNavigate();

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
      slidesToSlide: 3, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  return (
    <div className="px-8">
      <div className="text-xl crimson-600 mb-3">
    {name}
      </div>
      <Carousel
        className="pb-5"
        swipeable={false}
        draggable={false}
        showDots={false}
        responsive={responsive}
        ssr={true} // means to render carousel on server-side.
        infinite={true}
        autoPlay={false}
        autoPlaySpeed={1000}
        keyBoardControl={true}
        centerMode={true}
        customTransition="transform 300ms ease-in-out"
        transitionDuration={500}
        containerClass="carousel-container"
        removeArrowOnDeviceType={["tablet", "mobile"]}
        //   deviceType={this.props.deviceType}
        dotListClass="custom-dot-list-style"
        itemClass="carousel-item-padding-50-px"
      >
        {books.map((v) => (
          <div className="max-w-sm mr-5 cursor-pointer  rounded-lg overflow-hidden shadow-md hover:shadow-xl"
          onClick={()=>{
            navigate(`/book/${v.id}`)
          }}>
            <div className="w-full h-[224px] overflow-hidden">
              <img
                className="w-full h-full object-fill hover:scale-110 transition-transform duration-500 overflow-hidden"
                src={
                  v.volumeInfo.imageLinks?.thumbnail ||
                  "https://sciendo.com/product-not-found.png"
                }
                alt=""
              />
            </div>
            <div className="px-4 py-2">
              <div className="font-bold text-sm mb-2">
                {v.volumeInfo.title.slice(0, 30)}
              </div>
              <p className="text-gray-700 text-xs">
                {v.volumeInfo.authors
                  ? v.volumeInfo.authors[0].slice(0,20)
                  : "Unknown author"}
              </p>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default CarouselComponent;
