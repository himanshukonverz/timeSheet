import api from "../api/axios"
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCurrentLoggedInUser } from '../api/fetchCurrentUser';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser, setLoading } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", {email, password});
      console.log('res login - ', res);
      if (res?.data.success) {
        fetchCurrentLoggedInUser(setUser, setLoading);
        toast.success(res?.data.message || 'Login successfull!');
        navigate('/');
      }
    } catch (error) {
      console.log('error in login - ', error);
      toast.error(error.response?.data.message || 'Login failed, Please try again!');
    }
  };

  return (
    <div className="flex flex-col px-[5%] bg-[url('https://res.cloudinary.com/dr9ijlk4w/image/upload/v1754267050/bg-dots_rzzvhj.svg')] bg-center bg-repeat-x">
      <div className="flex w-full items-center">
        {/* Card */}
        <div className="hidden md:flex md:flex-col justify-start w-3/4">
          <img src='https://res.cloudinary.com/dr9ijlk4w/image/upload/v1767516808/Kognisight_dzt5kv.png' className="w-65 mt-2" alt="" />
          <img
            src="https://res.cloudinary.com/dr9ijlk4w/image/upload/v1767516808/login-img_wmr6qi.png"
            alt="banner"
            className="w-[75%] rounded-lg"
          />
        </div>
        <form
          className="relative w-full md:w-[40%] px-10 flex flex-col items-center"
          onSubmit={handleLogin}
        >
          <div className="bg-white shadow-2xl self-end rounded-2xl p-8 space-y-6 w-full">
            <h2 className="text-4xl font-semibold text-gray-800">Sign In</h2>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full px-4 py-2 border-b bg-gray-100 outline-0"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full px-4 py-2 border-b bg-gray-100 outline-0"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={`h-12 mt-4 w-full rounded-lg border border-black border-b-5 transition duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={email.length === 0 || password.length === 0}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
