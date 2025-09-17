import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export const Sidebar = ({
  open = true,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) => {
  const navigate = useNavigate();
  const { logout } = useUser();

  const sidebarItems = [
    {
      image: "/images/dashboard.svg",
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      image: "/images/start-bot.svg",
      label: "Start a Bot",
      path: "/create-bot",
    },
    {
      image: "/images/all-bots.svg",
      label: "All Bots",
      path: "/all-bots",
    },
    {
      image: "/images/saved-memories.svg",
      label: "Saved Memories",
      path: "/memories",
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden ${
          open ? "block" : "hidden"
        }`}
        onClick={onClose}
      />

      <div
        className={`z-50 md:z-auto md:static fixed md:relative top-0 left-0 md:top-auto md:left-auto h-full md:h-[calc(100vh-32px)] w-72 md:w-60 bg-white backdrop-blur-xl flex flex-col rounded-none md:rounded-[32px] transform transition-transform duration-200 md:transform-none ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
      <div className="p-4 flex justify-center">
        <img src="/images/logo.png" alt="YOUR LOGO HERE" className="w-40" />
      </div>

      <nav className="flex-1">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-300 mb-2 font-medium ${
              item.path === window.location.pathname
                ? "bg-[#2C2C2C] text-white"
                : "text-black hover:bg-[#2C2C2C] hover:text-white"
            }`}
            onClick={() => handleNavigation(item.path)}
          >
            <img src={item.image} alt={item.label} className="w-10 h-10" />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="px-5 mb-6 mt-auto">
        <button
          className="flex items-center justify-center gap-2 w-full py-3 text-red-500 hover:text-white hover:bg-red-500 border-none rounded-xl font-medium cursor-pointer"
          onClick={handleLogout}
        >
          <img
            src="/images/logout.svg"
            alt="Disconnect"
            className="w-10 h-10"
          />
          <span>Disconnect Wallet</span>
        </button>
      </div>
      </div>
    </>
  );
};
