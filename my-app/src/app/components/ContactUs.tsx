import { Landmark, Mail, Phone } from 'lucide-react';
import React from 'react';

const ContactUs = () => {
    return (
        <div className='flex justify-center align center  my-8 relative mb-9'>
            <div className='flex flex-row gap-15 flex-wrap'>
                <div className='text-white w-[30vw] h-[90vh] bg-[#101314] rounded-xl p-5'>
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


                        <button className='w-full bg-[linear-gradient(to_right,#098009,#7dd87d)] p-1 rounded-lg hover:scale-103 transition-all duration-200 cursor-pointer'> Send Mesage</button>
                    </form>
                </div>

                <div
                    className="relative w-[30vw] h-[90vh] flex flex-col bg-cover bg-center flex items-center justify-center"
                    style={{ backgroundImage: 'url("/contact.png")' }}
                >
                    <div className='w-full h-[55%] bg-transparent'></div>


                    <div className='w-full flex-1 bg-[#101314] rounded-xl py-6  px-3 flex flex-col gap-4'>

                        <div className='w-full text-gray-300 h-auto bg-gray-900 p-2 rounded-lg flex flex-row gap-6 items-center logo-text'>
                            <div className='bg-green-100/10 rounded-2xl p-2 w-fit h-fit'>
                                <Mail className='text-green-500' />
                            </div>
                            <div>
                                <div  className='font-bolder'>Email</div>
                                <div className='font6'>support@edumate.com</div>
                            </div>
                        </div>

                        <div className='w-full text-gray-300 h-auto bg-gray-900 p-2 rounded-lg flex flex-row gap-6 items-center logo-text'>
                            <div className='bg-green-100/10 rounded-2xl p-2 w-fit h-fit'>
                                <Phone className='text-green-500' />
                            </div>
                            <div>
                                <div className='font-bolder'>Phone</div>
                                <div className='font6'>+91 73073XXXXX</div>
                            </div>
                        </div>

                        <div className='w-full text-gray-300 h-auto bg-gray-900 p-2 rounded-lg flex flex-row gap-6 items-center logo-text'>
                            <div className='bg-green-100/10 rounded-2xl p-2 w-fit h-fit'>
                                <Landmark className='text-green-500' />
                            </div>
                            <div>
                                <div className='font-bolder'>Address</div>
                                <div className='font6'>Bennett University</div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div >
    );
}

export default ContactUs;
