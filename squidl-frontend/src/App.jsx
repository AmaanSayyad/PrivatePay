import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import RootProvider from "./providers/RootProvider";
import { RootLayout } from "./layouts/RootLayout.jsx";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
