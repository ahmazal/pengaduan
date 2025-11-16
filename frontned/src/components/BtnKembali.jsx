import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";

function BtnKembali() {
  const nav = useNavigate();
  return (
    <>
      <button
        onClick={() => nav(-1)}
        className="absolute left-8 top-8 z-20 cursor-pointer flex gap-2 items-center bg-black/35 px-4 py-2 rounded-sm text-white hover:bg-amber-900 duration-300 group"
      >
        <span>
          <IoIosArrowRoundBack />
        </span>
        <span>Kembali</span>
      </button>
    </>
  );
}

export default BtnKembali;
