import { FaPlane } from "react-icons/fa";
import { BsTrash } from "react-icons/bs";
import logo from "../../assets/logo.png";
import settingsIcon from "../../assets/setting-icon.png";
import { Fragment, useState } from "react";
import ProfilePopup from "../Profile";
import LoginPopup from "../Login";
import dimond from "../../assets/dimond.png";

export default function Header() {
     const [isPopupOpen, setIsPopupOpen] = useState(false);
     const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

     const openPopup = () => setIsPopupOpen(true);
     const closePopup = () => setIsPopupOpen(false);
     const openLoginPopup = () => setIsLoginPopupOpen(true);
     const closeLoginPopup = () => setIsLoginPopupOpen(false);

  return (
    <Fragment>
      <header className="flex items-center justify-between px-4 py-2 bg-[#000000] ">
        <div className="flex items-center space-x-2">
            <img src={logo} alt="" />
          <div className="">
            <span className="text-lg font-semibold text-white    ">
              Travel Animator
            </span>
          </div>
          <div className="flex bg-[#2A2A2A] items-center px-2 rounded-full">
            <img src={dimond} alt="" />
            <span className="px-2 py-0.5 text-xs text-white  rounded-full">
              PRO
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-1 cursor-pointer duration-300 hover:bg-gray-800 rounded-full bg-[#121216]">
            <img src={settingsIcon} className="w-8 h-8" alt="setting" />
          </button>
          <button className="p-3 cursor-pointer duration-300 hover:bg-gray-800 rounded-full bg-[#121216]">
            <BsTrash className=" text-red-500" />
          </button>
          <button className="px-4 py-1.5 cursor-pointer text-white bg-[#0A84FF] hover:bg-blue-600 rounded-[10.46px] text-sm">
            Export video
          </button>
          <div className="cursor-pointer" onClick={openPopup}>
            <img
              src="https://cdn-icons-png.flaticon.com/128/1144/1144709.png"
              alt="profile"
              className="w-8 h-8"
            />
          </div>
          <button
            onClick={openLoginPopup}
            className="px-4 py-1.5 cursor-pointer  text-white border border-gray-700 rounded-[10.46px] text-sm duration-300 hover:bg-gray-800"
          >
            Sign in
          </button>
        </div>
      </header>
      <ProfilePopup isOpen={isPopupOpen} onClose={closePopup} />
      <LoginPopup isOpen={isLoginPopupOpen} onClose={closeLoginPopup} />
    </Fragment>
  );
}
