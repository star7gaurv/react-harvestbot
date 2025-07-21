export const StatCardLayout = ({
  children,
  image,
  startColor,
  endColor,
  className = "",
}: {
  children: React.ReactNode;
  image: string;
  startColor: string;
  endColor: string;
  className?: string;
}) => {
  return (
    <div className="relative flex overflow-hidden rounded-3xl">
      {/* Background image positioned at right edge with 30% cropped and blurred */}
      <div
        className="absolute -right-[5%] w-48 h-48 bg-cover bg-no-repeat bg-right filter blur-sm z-0"
        style={{
          backgroundImage: `url('${image}')`,
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-10 opacity-80"
        style={{
          background: `linear-gradient(to right, ${startColor}, ${endColor})`,
        }}
      />

      {/* Content */}
      <div className={`relative z-20 w-full flex justify-center ${className}`}>
        {children}
      </div>
    </div>
  );
};
