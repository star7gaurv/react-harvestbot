import { useUser } from "../contexts/UserContext";

export const Navbar = ({
  title,
  subTitle,
  actions,
}: {
  title: string;
  subTitle?: string;
  actions?: React.ReactNode;
}) => {
  const { user } = useUser();

  return (
    <div className="flex flex-row w-full h-[110px] gap-4">
      <div className="flex w-3/4 items-center bg-white backdrop-blur-xl rounded-[32px] p-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-black">{title}</h1>
          {subTitle && (
            <h2 className="text-base font-bold text-black mt-1">{subTitle}</h2>
          )}
        </div>
        {actions && <div className="ml-auto flex gap-3">{actions}</div>}
      </div>
      <div className="flex w-1/4 items-center bg-white backdrop-blur-xl rounded-[32px] p-6">
        <div className="flex items-center gap-4 justify-between w-full">
          <div className="text-right">
            <span className="block text-2xl font-semibold text-black">
              {user?.username || "User"}
            </span>
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500"></div>
        </div>
      </div>
    </div>
  );
};
