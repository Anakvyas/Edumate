import Navbar from "../components/navbar"
import SlideShow from "../components/SlideShow"
import { GreenCircle, PurpleCircle, features } from "../components/feature"
import { linearGradient } from "framer-motion/client"
import FeatureCard from "../components/cards"
import AboutUs from "../components/about"
import RobotPage from "../components/Robort"
import ContactUs from "../components/ContactUs"

const HomePage = () => {
    // console.log(features);
    

    return (
        <div className="bg-background min-h-screen text-white text-font w-full relative" >

            <div className="relative w-full h-[270px]">
                <img
                    src="https://web-static3.shakker.ai/shakker_prd/static/_next/static/images/cover-grid.c4fe522893a5d4d1664f207b56f1b935.webp"
                    className="absolute inset-0 w-full object-cover mt-10 mb-17 z-0"
                    alt="Background"
                />

                <div className="flex flex-col justify-center items-center text-center relative z-50 mt-30 gap-1.5">
                    <h1 className="text-[40px] font-black text-transparent bg-clip-text bg-[linear-gradient(120deg,#7dd87d,#e0ebeb,#5e63b6)]">
                        Your Smart Study Partner
                    </h1>
                    <p className="text-[19px] text-gray-300 flex flex-col">
                        Learn, Create, and Grow with EduMate
                    </p>
                </div>
            </div>

            <section>
                <div className="flex flex-col justify-center items-center mt-20 mb-3 mx-20 gap-4 ">
                    <div className="head-font font-black text-3xl text-center w-full">Explore Our Smart Features</div>
                </div>
                <SlideShow />
                {/* <div className="absolute top-[70%] left-[4%] z-100"> <GreenCircle /></div>
                <div className="absolute top-[80%] right-[30%]"><PurpleCircle /></div> */}
            </section>

            <section className="mx-30 my-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center perspective-[1000px]">
                <FeatureCard />
            </section>

            <section className="min-h-[700px]">
                <h1 className="head-font font-black text-3xl text-center w-full">About Us</h1>
                <div className="absolute left-[-2%] w-[600px] h-[600px] z-10">
                    <RobotPage />
                </div>
                
                < div className="absolute right-[8%] z-10 " style={{ perspective: "4000px" }}>
                    <AboutUs/>
                </div>
            </section>


            <section className="min-h-[700px]">
                <h1 className="head-font font-black text-3xl text-center w-full">Contact Us</h1>
                <ContactUs/>
            </section>


        </div>
    )
}

export default HomePage