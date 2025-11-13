"use client"
import Navbar from "../components/navbar"
import SlideShow from "../components/SlideShow"
import { GreenCircle, PurpleCircle, features } from "../components/feature"
import { linearGradient } from "framer-motion/client"
import FeatureCard from "../components/cards"
import AboutUs from "../components/about"
import RobotPage from "../components/Robort"
import ContactUs from "../components/ContactUs"
import { motion } from "framer-motion";

const HomePage = () => {
    // console.log(features);


    return (
        <div className="bg-background min-h-screen text-white text-font w-full relative" >

            <div id='home' className="relative w-full h-[270px]">
                <img
                    src="https://web-static3.shakker.ai/shakker_prd/static/_next/static/images/cover-grid.c4fe522893a5d4d1664f207b56f1b935.webp"
                    className="absolute inset-0 w-full object-cover mt-10 mb-17 z-0"
                    alt="Background"
                />

                <div className="font4 flex flex-col justify-center items-center text-center relative z-50 mt-30 gap-1.5">
                    <h1 className="text-[40px] font-black text-transparent bg-clip-text bg-[linear-gradient(120deg,#7dd87d,#e0ebeb,#5e63b6)]">
                        Your Smart Study Partner
                    </h1>
                    <p className="text-gray-100 text-lg sm:text-xl font-light mt-3 max-w-3xl font3">
                        Learn, Create, and Grow with EduMate
                    </p>
                </div>
            </div>

            <section >
                <div className="flex flex-col justify-center items-center mt-20 mb-3 mx-20 gap-4 ">
                    <div className="heading font-bold text-3xl text-center w-full">Explore Our Smart Features</div>
                </div>
                <SlideShow />

                {/* <div className="absolute top-[70%] left-[4%] z-100"> <GreenCircle /></div>
                <div className="absolute top-[80%] right-[30%]"><PurpleCircle /></div> */}
            </section>

            <section id='features' className="mx-30 my-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center perspective-[1000px]">
                <FeatureCard />
            </section>

            <section className="min-h-[700px]" id='about'>
                <h1 className="heading font-bold text-3xl text-center w-full hero-bg h-auto">About Us</h1>
                <div className="absolute left-[-2%] w-[600px] h-[600px] z-10">
                    <RobotPage />
                </div>

                < div className="absolute right-[8%] z-10 " style={{ perspective: "4000px" }}>
                    <AboutUs />
                </div>
            </section>


            <section className="min-h-[700px] mb-8 " id='contact'>
                <h1 className="heading font-bold text-3xl text-center w-full">Contact Us</h1>
                <ContactUs />
            </section>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.4 }}
                className="w-full text-center py-10 font5"

            >
                <p className="text-lg md:text-2xl font-medium text-gray-200 leading-relaxed">
                    "Education is not the learning of facts,
                    but the training of the mind to think.”
                </p>
                <p className="mt-3 text-sm md:text-base text-green-300 font-light">
                    — Albert Einstein
                </p>
            </motion.div>

        </div>
    )
}

export default HomePage