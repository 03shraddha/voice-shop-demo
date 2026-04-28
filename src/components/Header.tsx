import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export function Header() {
  const navigate = useNavigate();
  const { itemCount } = useCart();

  return (
    <header className="bg-amazon-navy text-white sticky top-0 z-40 shadow">
      <div className="flex items-center px-3 py-1.5 gap-2">
        <button
          onClick={() => navigate("/")}
          className="hover:ring-1 hover:ring-white rounded px-1 py-0.5"
        >
          <div className="flex flex-col items-start">
            <span className="font-bold text-xl whitespace-nowrap tracking-tight">
              amazon
              <span className="text-amazon-orange text-[10px] align-super ml-0.5">.com</span>
            </span>
            <div
              className="bg-amazon-orange"
              style={{ width: "88%", height: "2px", borderRadius: "0 0 40% 40%" }}
            />
          </div>
        </button>

        <div className="hidden md:flex flex-col text-xs whitespace-nowrap ml-1 cursor-default hover:ring-1 hover:ring-white rounded px-1 py-0.5">
          <span className="text-gray-400 flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            Delivering to
          </span>
          <span className="font-bold text-white text-xs">United States</span>
        </div>

        <div className="flex flex-1 max-w-2xl h-10">
          <button className="bg-[#3d4f5d] text-gray-800 text-xs px-2 h-full rounded-l-md border-r border-gray-400 whitespace-nowrap flex items-center gap-1">
            All <span className="text-gray-600">▾</span>
          </button>
          <input
            type="text"
            placeholder="Search Amazon.com..."
            readOnly
            className="flex-1 px-3 text-sm text-gray-900 bg-white focus:outline-none"
          />
          <button className="bg-amazon-orange hover:bg-amazon-orange-dark px-4 rounded-r-md transition-colors flex items-center justify-center">
            <svg className="w-5 h-5 text-amazon-navy" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="hidden sm:flex flex-col text-xs whitespace-nowrap hover:ring-1 hover:ring-white rounded px-1 py-0.5 cursor-default">
          <span className="text-gray-300">Hello, Sign in</span>
          <span className="font-bold text-white">Account &amp; Lists ▾</span>
        </div>

        <div className="hidden md:flex flex-col text-xs whitespace-nowrap hover:ring-1 hover:ring-white rounded px-1 py-0.5 cursor-default">
          <span className="text-gray-300">Returns</span>
          <span className="font-bold text-white">&amp; Orders</span>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className="flex items-end gap-1 hover:ring-1 hover:ring-white rounded px-1 py-0.5 transition-all"
        >
          <div className="relative">
            <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
            </svg>
            <span className="absolute top-0 right-1 text-amazon-orange font-bold text-sm leading-none">
              {itemCount > 0 ? (itemCount > 99 ? "99+" : itemCount) : 0}
            </span>
          </div>
          <span className="text-white font-bold text-sm mb-1">Cart</span>
        </button>
      </div>

      <div className="bg-amazon-navy-light px-3 py-1 flex items-center gap-0.5 text-sm overflow-x-auto">
        <button className="flex items-center gap-1 whitespace-nowrap text-white hover:ring-1 hover:ring-white rounded px-2 py-1 font-bold">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          All
        </button>
        {["Fresh", "Today's Deals", "Amazon Pay", "Gift Cards", "Gift Ideas", "Buy Again", "AmazonBasics", "Sell", "Customer Service", "New Arrivals"].map(
          (label) => (
            <button key={label} className="whitespace-nowrap text-white hover:underline px-2 py-1">
              {label}
            </button>
          )
        )}
      </div>
    </header>
  );
}
