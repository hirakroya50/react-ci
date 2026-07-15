interface AvatarProps {
  name?: string;
  email?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Avatar = ({ name, email, size = "md", className = "" }: AvatarProps) => {
  const getInitials = () => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "?";
  };

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] flex items-center justify-center text-white font-bold shadow-sm ${className}`}
    >
      {getInitials()}
    </div>
  );
};

export default Avatar;
