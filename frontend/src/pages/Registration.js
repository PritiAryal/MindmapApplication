import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";

const RegistrationPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const existingUsersResponse = await axiosInstance.get("/applicationuser");
      const existingUsers = existingUsersResponse.data;

      const nameExists = existingUsers.some((user) => user.name === name);
      const emailExists = existingUsers.some((user) => user.email === email);

      if (nameExists) {
        setError("Username already exists.");
        return;
      }

      if (emailExists) {
        setError("Email already exists.");
        return;
      }

      const newUser = { name, email, password };
      const response = await axiosInstance.post("/applicationuser", newUser);

      setSuccessMessage("User created successfully");
      localStorage.setItem("token", response.data.token);

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError("Registration failed. Please try again.");
      console.error("Registration failed", error);
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
            <h1 className="text-lg font-bold text-zinc-400 text-shadow text-left border-yellow-400 border-b-2 pb-1">
              With new features for you convenience.
            </h1>
          </div>
          <div className="rounded-lg shadow-lg bg-opacity-10 bg-white bg-blur-lg bg-clip-padding backdrop-filter backdrop-blur-md text-white border-b-2 border-white border-opacity-45 p-8 max-w-md w-full">
            <h1 className="text-xl font-bold text-zinc-400 text-shadow text-center">
              Registration
            </h1>
            <div className="space-y-4 mt-6">
              <input
                type="text"
                placeholder="Name"
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
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-transparent border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={handleRegister}
                className="w-full py-2 bg-gradient-to-bl from-yellow-400 to-yellow-300 text-white font-semibold rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                Register
              </button>
              <div className="relative w-full  text-center">
                <span className="text-sm text-zinc-600">
                  Click Here to
                  <span className="text-yellow-600">
                    <Link to="../"> Login! </Link>
                  </span>
                </span>
              </div>
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-xs bg-opacity-25 bg-blur-lg bg-clip-padding backdrop-filter backdrop-blur-lg"
                  role="alert"
                >
                  <span className="block sm:inline"> {error} </span>
                  <span className="absolute top-0 bottom-0 right-0 px-4 py-3 text-xs">
                    <svg
                      className="fill-current h-4 w-4 text-red-700"
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
              {successMessage && (
                <div
                  className="bg-teal-100 border border-teal-400 text-teal-700 px-4 py-3 rounded relative text-xs bg-opacity-25 bg-blur-lg bg-clip-padding backdrop-filter backdrop-blur-lg"
                  role="alert"
                >
                  <span className="block sm:inline"> {successMessage} </span>
                  <span className="absolute top-0 bottom-0 right-0 px-4 py-3 text-xs">
                    <svg
                      className="fill-current h-4 w-4 text-teal-700"
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

export default RegistrationPage;
