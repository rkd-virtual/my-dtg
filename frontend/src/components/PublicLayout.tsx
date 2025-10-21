import { Outlet } from "react-router-dom";
//import Layout from "./Layout"; // your existing one with Navbar + dropdowns

export default function PublicLayout() {
  return (
//<Layout>
      <Outlet />
   // </Layout>
  );
}
