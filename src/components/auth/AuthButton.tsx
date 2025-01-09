import { LogOut } from "lucide-react";

interface AuthButtonProps {
  isAuthenticated: boolean;
  onClick: () => void;
}

export const AuthButton = ({ isAuthenticated, onClick }: AuthButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 bg-purple-primary hover:bg-purple-primary/90 text-white rounded-md px-3 py-2 transition-colors"
      aria-label={isAuthenticated ? "Sign out" : "Sign in"}
    >
      {isAuthenticated ? (
        <>
          <LogOut className="w-5 h-5 text-white" />
          <span className="hidden sm:inline">Sign Out</span>
        </>
      ) : (
        <span>Sign In</span>
      )}
    </button>
  );
};