import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";
import "../index.css";

const LoginPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post("/login", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      const tokenOn = localStorage.getItem("token");
      if (tokenOn !== null) {
        navigate("/dashboard");
      }
    } catch (error) {
      setError("Invalid credentials");
      console.error("Login failed", error);
    }
  };

  return (
    <div className="bg-login">
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-row rounded-lg shadow-lg border-b-2 border-white border-opacity-45 max-w-screen-md w-full">
          <div className="flex flex-col items-left justify-center text-left bg-white text-white p-8 min-w-[35vw]">
            <h1 className="text-3xl font-bold text-zinc-400 text-shadow text-left pt-2">
              Mindmap
            </h1>
            <h1 className="text-lg font-bold text-zinc-400 text-shadow text-left pb-4 border-yellow-400 border-b-2">
              With new features for you convenience.
            </h1>
          </div>
          <div className="rounded-lg bg-opacity-10 bg-white bg-blur-lg bg-clip-padding backdrop-filter backdrop-blur-sm p-8 text-white">
            {/*border-b-2 border-white border-opacity-45 p-8 max-w-md w-full rounded-lg shadow-lg*/}
            {/* //  "bg-white bg-opacity-50 backdrop-filter backdrop-blur-md rounded-lg shadow-lg p-8 max-w-md w-full"> */}
            <h1 className="text-xl font-bold text-zinc-400 text-shadow text-center pb-8">
              SIGN IN
            </h1>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border bg-transparent border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border bg-transparent border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-transparent border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-zinc-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-zinc-500" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogin}
                className="w-full py-2 bg-gradient-to-bl from-yellow-400 to-yellow-300 text-white font-semibold rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                Login
              </button>
              <div className="relative w-full text-center justify-center items-center">
                <span className="text-sm ">
                  <span className="text-zinc-600">
                    <Link to="./UserRegister">
                      <span className="text-yellow-600"> Sign up! </span> to
                      create an account
                    </Link>
                  </span>
                </span>
              </div>
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline"> {error} </span>
                  <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <svg
                      className="fill-current h-6 w-6 text-red-500"
                      role="button"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <title>Close</title>
                      <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                    </svg>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
