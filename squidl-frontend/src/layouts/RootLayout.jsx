import { LayoutGroup } from "framer-motion";
import { Toaster } from "react-hot-toast";

export const RootLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-primary-50">
      <Toaster />
      <LayoutGroup>{children}</LayoutGroup>
    </div>
  );
};
