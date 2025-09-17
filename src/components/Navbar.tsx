import { useUser } from "../contexts/UserContext";

export const Navbar = ({
  title,
  subTitle,
  actions,
  onMenuClick,
}: {
  title: string;
  subTitle?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}) => {
  const { user } = useUser();

  return (
    <div className="flex flex-col md:flex-row w-full gap-3 md:gap-4">
      <div className="flex items-center bg-white backdrop-blur-xl rounded-[20px] px-4 sm:px-6 py-3 md:py-0 w-full md:w-3/4">
        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden mr-3 inline-flex items-center justify-center rounded-md p-2 text-black/70 hover:bg-black/5"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="flex flex-col w-full">
          <div className="flex items-center w-full">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">{title}</h1>
            {actions && <div className="ml-auto hidden sm:flex gap-3">{actions}</div>}
          </div>
          {subTitle && (
            <h2 className="text-sm sm:text-base font-bold text-black mt-1">{subTitle}</h2>
          )}
          {/* Actions on mobile below title */}
          {actions && <div className="mt-2 sm:hidden flex gap-2">{actions}</div>}
        </div>
      </div>
      <div className="flex items-center bg-white backdrop-blur-xl rounded-[20px] px-4 sm:px-6 py-3 md:py-0 w-full md:w-1/4">
        <div className="flex items-center gap-4 justify-between w-full">
          <div className="text-left md:text-right">
            <span className="block text-lg sm:text-2xl font-semibold text-black">
              {user?.username || "User"}
            </span>
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500"></div>
        </div>
      </div>
    </div>
  );
};
