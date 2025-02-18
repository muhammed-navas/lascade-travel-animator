import React, { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { CiCircleCheck } from "react-icons/ci";
import whatsapp from "../assets/socialMedia/whatsapp.png";
import facebook from "../assets/socialMedia/facebook.png";
import instagram from "../assets/socialMedia/instagram.png";
import tickTok from "../assets/socialMedia/tik-tok.png";
import youtube from "../assets/socialMedia/youtube.png";
import signOut from "../assets/signOut.png"
import check from "../assets/check.png"

export default function ProfilePopup({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("Profile");

  if (!isOpen) return null;

const socialMedia = [
  {
    icon: whatsapp,
    link: "#",
  },
  {
    icon: facebook,
    link: "#",
  },
  {
    icon: instagram,
    link: "#",
  },
  {
    icon: tickTok,
    link: "#",
  },
  {
    icon: youtube,
    link: "#",
  },
];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="w-full max-w-3xl h-3/4 border border-gray-700 bg-[#121216] rounded-[26px] shadow-xl overflow-hidden flex">
        {/* Left sidebar */}
        <div className="w-64 bg-[#121216] py-4 flex flex-col">
          <button
            onClick={onClose}
            className="self-start cursor-pointer p-2 mr-2 text-gray-400 hover:text-white"
          >
            <IoClose size={24} />
          </button>

          <div className="flex flex-col space-y-2 px-4 mt-6">
            {[
              "Profile",
              "Subscription",
              "Community",
              "Account",
              "Request a feature",
            ].map((item) => (
              <button
                className={`py-2 px-4 text-center cursor-pointer text-sm  rounded-full ${
                  activeTab === item
                    ? "bg-[#0A84FF] text-white "
                    : "text-gray-300 hover:bg-[#25252D]"
                }`}
                onClick={() => setActiveTab(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-auto flex justify-evenly  pb-4">
            {socialMedia.map((item) => (
              <div>
                <img src={item.icon} alt={item.icon} className="w-7 h-7" />{" "}
              </div>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 p-4 bg-black overflow-y-scroll profile">
          <h4 className="text-gray-600 text-sm mb-5">Profile</h4>
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/1144/1144709.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-normal text-white">Andrews</h2>
                <p className="text-gray-400 text-xs">andrews345@gmail.com</p>
              </div>
            </div>
            <div className="px-6 cursor-pointer py-2 border border-gray-800 items-center  rounded-full flex h-10 gap-1">
              <img src={signOut} alt={signOut} />
              <button className="text-white text-xs">Sign out</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#8C8C8C1C] p-4 rounded-lg">
              <h3 className="text-gray-400 mb-2 text-xs">Videos created</h3>
              <p className="text-5xl font-semibold text-white">24</p>
            </div>
            <div className="bg-[#8C8C8C1C] p-4 rounded-lg">
              <h3 className="text-gray-400 mb-2 text-xs">Countries explored</h3>
              <p className="text-5xl font-semibold text-white">08</p>
            </div>
          </div>

          <h3 className="text-gray-400 mb-4">Subscription</h3>
          <div
            style={{
              background:
                "linear-gradient(135deg, #B6CAFFB2 0%, #7187C04D 100%)",
            }}
            className=" p-6 rounded-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white text-sm">Upgrade to PRO</h4>
              <button className="bg-[#004CE2] text-white px-3 py-1 rounded-full text-xs">
                Get PRO
              </button>
            </div>
            <ul className="space-y-3">
              <li className="text-white flex items-center space-x-2">
                <CiCircleCheck className="text-gray-600" />
                <span>Premium animated 3d models</span>
              </li>
              <li className="text-white flex items-center space-x-2">
                <CiCircleCheck className="text-gray-600" />
                <span>Multiple map styles</span>
              </li>
              <li className="text-white flex items-center space-x-2">
                <CiCircleCheck className="text-gray-600" />
                <span>No Ads + No Watermarks</span>
              </li>
              <li className="text-white flex items-center space-x-2">
                <CiCircleCheck className="text-gray-600" />
                <span>Unlimited videos</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
