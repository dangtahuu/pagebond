import { BsTicketPerforated } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    "Keep track of every film you’ve ever watched (or just start from the day you join)",
    "Show some love for your favorite films, lists and reviews with a “like”",
    "Write and share reviews, and follow friends and other members to read theirs",
    "Rate each film on a five-star scale (with halves) to record and share your reaction",
    "Keep a diary of your film watching (and upgrade to Pro for comprehensive stats",
    "Compile and share lists of films on any topic and keep a watchlist of films to see",
  ];

  const Voucher = ({ data }) => {
    return (
      <div
        className="flex flex-col items-center mb-3 md:flex-row w-full "
        //   key={a.suggestedBook._id}
      >
        <div
          className="object-cover flex justify-center items-center h-[100px] bg-greenBtn cursor-pointer w-[80px] md:rounded-l-lg"
          // src={a.suggestedBook.thumbnail || "https://sciendo.com/product-not-found.png"}
          alt=""
          // onClick={() => navigate(`/book/${a.suggestedBook._id}`)}
        >
          <BsTicketPerforated className="text-3xl" />
        </div>
        <div className="flex justify-between items-center gap-x-4 p-2 bg-dialogue rounded-r-lg h-[100px] flex-1">
          <div className="flex flex-col justify-between">
            <p>{data}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="w-screen h-screen">
        <img
          src="images/book-collage.png"
          alt="home"
          className="block fixed top-0 left-0 h-full w-full"
        />
        <div className="bg-gradient-to-t relative from-black/100 to-black/75 relative flex flex-col justify-center items-center z-[200] w-screen min-h-screen px-[10%] pb-[5%] gap-y-8">
       
          <div className="h-screen relative flex items-center">
          <div className="absolute -left-[144px]">
          <img
                  src="images/screenshot-homepage.png"
                  alt="home"
                  className="hidden sm:block w-[40vw] rounded-lg shadow"
                />
          </div>
            <div className="sm:grid sm:grid-cols-2">
              <div className="sm:col-span-1 flex items-center justify-center">
               
              </div>
              <div className="sm:col-span-1">
                <div className="pt-4 p-6 sm:pr-[25px] md:pr-[50px] lg:pr-[100px] text-[40px] sm:text-[40px] md:text-[45px] lg:text-[50px] xl:text-[70px]  z-10 text-white ">
                  <div className="serif-display">PageBond</div>
                  <div className="text-[14px] sm:text-[16px] md:text-[22px]">
                    Reading and sharing
                  </div>
                  <div>
                    <div className="text-base text-justify mt-3 ">
                      Welcome to PageBond, the ultimate site for book lovers!
                      You can discover new books, create a personalized reading
                      list, and share your own reviews and recommendations with
                      a community of fellow bookworms. Join us today and start
                      your literary journey!
                    </div>
                    <div className="flex gap-x-3 items-center text-xl justify-center mt-6 sm:mt-8 md:mt-10 ">
                      <button
                        className="primary-btn w-[200px]"
                        onClick={() => {
                          navigate("/login");
                        }}
                      >
                        Login
                      </button>
                      <button
                        className="primary-btn w-[200px]"
                        onClick={() => {
                          navigate("/register");
                        }}
                      >
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="serif-display text-xl mb-3 text-center">
              PageBond provides you with a feature-rich experience
            </div>
            <div className="grid grid-cols-3 z-[202] relative gap-x-5">
              {features.map((one) => (
                <Voucher data={one} />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-y-3 text-3xl w-[500px]">
            <div>A community like no other</div>
            <div className="serif-display text-6xl">10,000+ </div>
            <div>People have joined PageBond</div>
          </div>
        </div>
      </div>

      <img
        src="images/home-icon2.png"
        alt="home"
        className="w-[70%] absolute bottom-0 left-[50%] -translate-x-[50%] sm:hidden"
      />
    </div>
  );
};

export default Home;
