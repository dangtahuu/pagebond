import {useNavigate} from "react-router-dom";
import {Nav} from "../components";
import {useAppContext} from "../context/useContext";

const Home = () => {
    const navigate = useNavigate();
    const {dark} = useAppContext();

    return (
        <div>
            <Nav />
            <div className='w-screen h-screen '>
               

                <img
                    src='images/img-home.png'
                    alt='home'
                    className='absolute hidden sm:block right-[-18px] top-0 h-full w-7/12 wave '
                />

                <div className='top-[8vh] leading-12 pt-4 sm:top-[13vh] md:top-[15vh] left-10 text-[40px] sm:text-[40px] md:text-[45px] lg:text-[50px] xl:text-[70px] crimson-600 z-10 absolute text-[#210028] dark:text-sky-300 '>
                    PageBond
                    <div className='text-[14px] sm:text-[16px] md:text-[22px] text-pink-600 crimson '>
                        Reading and sharing
                    </div>
                </div>

                <img
                    src='images/home_circle.png'
                    alt='home'
                    className='absolute block sm:hidden left-[50vw] -translate-x-1/2 top-[32vh] w-[218px] sm:w-4/12 '
                />
                <div className='absolute top-[85vh] sm:top-[60vh] pb-8 left-10 sm:w-[50%] pr-5 md:pr-0'>
                
                    <div className='sm:text-base md:text-[16px] '>
                    Welcome to <strong>PageBond</strong>, the ultimate site for book lovers! You can discover new books, create a personalized reading list, and share your own reviews and recommendations with a community of fellow bookworms. Join us today and start your literary journey!
                    </div>
                    <div className='flex gap-x-3 items-center justify-start mt-6 sm:mt-8 md:mt-10 '>
                        <button
                            className='btn-home'
                            onClick={() => {
                                navigate("/login");
                            }}>
                            Login
                        </button>
                        <button
                            className='btn-home'
                            onClick={() => {
                                navigate("/register");
                            }}>
                            Register
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
