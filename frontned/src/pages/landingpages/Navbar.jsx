import { useEffect } from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom"

function Navbar() {
  const [isActive, setIsActive] = useState(false)
  const [lastScroll, setLastScroll] = useState(0)
  const Navigate = useNavigate();

  useEffect(() => {
    const HandleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 80) {
        setIsActive(true)
      } else {
        setIsActive(false)
      }
      setLastScroll(currentScroll)
    };
    window.addEventListener('scroll', HandleScroll)
    return ()=> window.removeEventListener('scroll', HandleScroll)
  }, [lastScroll])

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`w-full z-30 fixed ${isActive ? '-translate-y-full' : 'translate-y-0'} duration-300`}>
      <div className="px-4 py-2 flex justify-between items-center backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold">LaporKang</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="cursor-pointer" onClick={() => scrollToSection("Beranda")}>Beranda</button>
          <button className="cursor-pointer" onClick={() => scrollToSection("Carakerja")}>Cara Kerja</button>
          <button className="cursor-pointer" onClick={() => scrollToSection("Berita")}>Berita</button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => Navigate("/Login")} className="cursor-pointer border border-transparent bg-amber-500 p-2 rounded-full font-bold text-white">Login</button>
          <span onClick={() => Navigate("/Register")} className="cursor-pointer border border-amber-500 p-2 rounded-full font-bold">Register</span>
        </div>
      </div>
    </div>
  )
}

export default Navbar