import React from 'react';

const ContactUs = () => {
    return (
        <div className='flex justify-center align center  my-8 relative'>
            <div className='flex flex-row gap-15 flex-wrap'>
                <div className='text-white w-[450px] h-auto bg-[#101314] rounded-xl p-5'>
                    <span className='text-orange-500'>Get in Touch</span>
                    <h1 className='text-[1.75rem] font-black mt-3'>Let's Chat, Reach Out to Us</h1>
                    <span className='text-gray-300 text-sm'>Have questions or feedback? We're here to help. Send us a message and we'll respond within 24hours.</span>
                    <hr className='mt-3 text-gray-500' />

                    <form className='mt-5'>
                        <div className='flex flex-row justify-between gap-5 my-4'>
                            <label className='flex flex-col ' htmlFor="firstname"> <span className='my-1'>First Name</span>
                                <input id="firstname" className="w-full bg-gray-700 outline-none rounded-md p-1" type='text' placeholder='First name ' />
                            </label>
                            <label className='flex flex-col' htmlFor="Lastname"> <span className='my-1'>Last Name</span>
                                <input id="Lastname" className="w-full bg-gray-700 outline-none rounded-md p-1" type='text' placeholder='Last name ' />
                            </label>
                        </div>

                        <label className='flex flex-col mb-2' htmlFor="email">Email Address</label>
                        <input id="email" className="w-full bg-gray-700 outline-none rounded-md p-1 mb-4" type="email" placeholder='Email Address ' />
                        <label className='flex flex-col mb-2' htmlFor="messsge">Message</label>
                        <input id="message" className="w-full h-[100px] bg-gray-700 outline-none rounded-md p-1 text-start mb-3" type='textarea' placeholder='Leave us Message ' />


                        <div className='flex flex-row gap-6 mb-3'>
                            <input type='checkbox' />
                            <p className='text-sm'>I agree to our friendly <u>privacy policy</u></p>
                        </div>


                        <button className='w-full bg-[linear-gradient(to_right,#098009,#7dd87d)] p-1 rounded-lg'> Send Mesage</button>
                    </form>
                </div>

                <div className=''>
                    <img src="./contact.png" className='w-'></img>
                    <div className='absolute top-[50%] right-[10%] text-white min-w-xl h-[300px] bg-[#101314] z-19 rounded-lg'></div>
                </div>
            </div>
        </div >
    );
}

export default ContactUs;
