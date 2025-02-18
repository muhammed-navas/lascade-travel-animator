import React from "react";
import { IoClose } from "react-icons/io5";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import logoImg from "../assets/login-img.png";
import travelText from "../assets/travel-text.png";
import dimond from "../assets/dimond.png";

export default function LoginPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80  z-50">
      <div className="w-full max-w-2xl bg-[#121216] rounded-3xl shadow-xl overflow-hidden flex">
        {/* Left side - Blue background with logo and images */}
        <div className="w-2/5 bg-[#0A84FF] relative pt-8  flex flex-col">
          <button
            onClick={onClose}
            className="absolute cursor-pointer top-4 left-4 text-white hover:text-gray-200"
          >
            <IoClose size={24} />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="mt-4 mb-auto">
              <div className="relative text-center ">
                <img
                  src={travelText}
                  alt="Travel Animator"
                  className="mx-auto transform -rotate-2"
                  style={{ maxWidth: "80%" }}
                />
                <div className="inline-flex absolute top-14 left-[100px] items-center bg-white rounded-full px-3 py-1 ">
                  <div className="text-sm font-medium flex items-center gap-2">
                   <img src={dimond} alt="" />
                    PRO
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full mt-auto">
              <img
                src={logoImg}
                alt="Travel illustrations"
                className="w-full"
              />
              {/* <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0A84FF] to-transparent"></div> */}
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="max-w-xs mx-auto p-8 flex flex-col justify-center">
          <h1 className="text-2xl font-semibold text-white mb-8 text-center">
            Log In / Sign Up
          </h1>

          <div className="space-y-4 ">
            <button className="w-full cursor-pointer flex items-center justify-center space-x-3 bg-white hover:bg-gray-100 text-black py-3 px-7 rounded-full">
              <span className="flex items-center justify-center">
                <FaApple size={20} className="mr-2" />
                Continue with Apple
              </span>
            </button>

            <button className="w-full cursor-pointer flex items-center justify-center space-x-3 bg-white hover:bg-gray-100 text-black py-3 px-7 rounded-full">
              <span className="flex items-center justify-center">
                <FcGoogle size={20} className="mr-2" />
                Continue with Google
              </span>
            </button>
          </div>

          <p className="text-gray-500 text-sm mt-8   ">
            By continuing, you accept our Terms of Service and acknowledge
            receipt of our Privacy & Cookie Policy
          </p>
        </div>
      </div>
    </div>
  );
}
