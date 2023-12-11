import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="w-screen h-screen overflow-hidden">
        <img
          src="images/background.png"
          alt="home"
          className="block absolute h-full w-full"
        />
        <div className="sm:grid sm:grid-cols-2 relative top-[5%] sm:top-[25%]">
          <div className="sm:col-span-1 flex items-center justify-center">
            <img
              src="images/home-icon.png"
              alt="home"
              className="hidden sm:block w-[70%] lg:w-[50%]"
            />
          </div>
          <div className="sm:col-span-1">
            <div className="pt-4 p-6 sm:pr-[25px] md:pr-[50px] lg:pr-[100px] text-[40px] sm:text-[40px] md:text-[45px] lg:text-[50px] xl:text-[70px]  z-10 text-white ">
              <div className="serif-display">PageBond</div>
              <div className="text-[14px] sm:text-[16px] md:text-[22px]">
                Reading and sharing
              </div>
              <div>
                <div className="text-base text-justify mt-3 ">
                  Welcome to PageBond, the ultimate site for book lovers! You
                  can discover new books, create a personalized reading list,
                  and share your own reviews and recommendations with a
                  community of fellow bookworms. Join us today and start your
                  literary journey!
                </div>
                <div className="flex gap-x-3 items-center text-xl justify-center mt-6 sm:mt-8 md:mt-10 ">
                  <button
                    className="primary-btn w-[200px] bg-black"
                    onClick={() => {
                      navigate("/login");
                    }}
                  >
                    Login
                  </button>
                  <button
                    className="primary-btn w-[200px] bg-black"
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
      <img
        src="images/home-icon2.png"
        alt="home"
        className="w-[70%] absolute bottom-0 left-[50%] -translate-x-[50%] sm:hidden"
      />
    </div>
  );
};

export default Home;
