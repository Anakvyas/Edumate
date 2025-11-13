import React from 'react';
import { MapPin, Phone, Mail, GraduationCap, BookOpen, PenTool } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-10 relative bg-gradient-to-br from-[#0b0b0f] via-[#0e0e12] to-[#11131a] text-gray-200 overflow-hidden border-t border-white/5">

      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <GraduationCap className="absolute top-10 right-24 w-10 h-10 text-indigo-400 opacity-20 animate-pulse" />
        <BookOpen className="absolute bottom-16 left-24 w-8 h-8 text-sky-400 opacity-25 animate-bounce" style={{ animationDelay: '2s' }} />
        <PenTool className="absolute top-1/3 right-10 w-10 h-10 text-violet-300 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-sky-300 to-violet-300 bg-clip-text text-transparent tracking-wide">
                Edumate
              </h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm font-light">
              Edumate empowers learners with AI-driven personalized education.
              Connect, learn, and grow through our intelligent academic platform
              designed for universities, mentors, and students alike.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-200">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              {[
                { href: "/about", text: "About Us" },
                { href: "/courses", text: "Courses" },
                { href: "/contact", text: "Contact" },
                { href: "/privacypolicy", text: "Privacy Policy" },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="group flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-all duration-300"
                >
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full group-hover:scale-125 group-hover:bg-white transition-transform duration-300"></span>
                  <span className="group-hover:translate-x-1 transition-transform">{link.text}</span>
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-indigo-200">Contact Us</h3>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Our Location</p>
                  <p className="text-sm text-gray-200">
                    Bennett University<br />
                    Greater Noida, Uttar Pradesh - 201310
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Call Us</p>
                  <p className="text-sm text-gray-200">+91 73073XXXXX</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email Us</p>
                  <p className="text-sm text-gray-200">support@edumate.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-10 pt-4 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 space-y-2 md:space-y-0">
            <p>© 2025 <span className="text-indigo-400 font-medium">Edumate</span>. All Rights Reserved.</p>
            <p>
              Designed and Developed for {' '}
              <span className="text-white font-semibold">AI PROJECT</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
