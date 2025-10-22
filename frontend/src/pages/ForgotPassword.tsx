import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import logo from "../assets/DTG_Logo_login.svg";

export default function ForgotPassword() {
  return (
    <Layout>
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <img src={logo} alt="Login Logo" className="login_logo"/>
        <h1 className="mb-6 text-center text-2xl font-semibold">Enter your email to reset your password</h1>
        <p className="text-gray-600 text-center;">Password reset functionality coming soon.</p>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600">
            Log In
          </Link>
        </p>
      </div>
    </Layout>
  );
}
