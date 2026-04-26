import { useState } from 'react';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios'
import { BASE_URL } from '../api/auth';
import {Link} from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg'; // adjust path as needed

import { ToastContainer,toast } from 'react-toastify';
function SuperAdminReset() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
const navigate=useNavigate();
  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    
 try{
    if (!validateForm()) {
        return;
      }
  
      setIsLoading(true);
   
     let response= await axios.post(`${BASE_URL}/admin/resetPassword`,{email:email,password:newPassword})
      setEmail('')
      setNewPassword('')
      setConfirmPassword('')
    setIsSuccess(true)
    setIsLoading(false)
    toast.success(response.data.message,{containerId:"adminResetPage"})
    navigate('/superadmin/login')
 }catch(e){
setIsLoading(false)
if(e?.response?.data?.error){
    toast.error(e?.response?.data?.error,{containerId:"adminResetPage"})
}else{
    toast.error("Error occured while trying to reset password",{containerId:"adminResetPage"})
}
 }
  };

  const handleBackToLogin = () => {
    // Navigate back to login - you can replace this with your routing logic
    window.location.href = '/superadmin/login';
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-800 px-8 py-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h1>
              <p className="text-green-100 text-sm">Your password has been updated</p>
            </div>

            <div className="px-8 py-10 text-center">
              <p className="text-gray-600 mb-6">
                Your password for <strong>{email}</strong> has been successfully reset. You can now log in with your new password.
              </p>
              <Link to='/superadmin/login'>
           
              <button
               
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:from-purple-700 hover:to-purple-900 transform hover:scale-[1.02]"
              >
                Back to Login
              </button>
           </Link>
            </div>

            <div className="px-8 pb-10">
              <div className="pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  🔒 Keep your password secure and don't share it with anyone.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-white text-sm mt-6 opacity-75">
            © 2025 Admin Panel. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
  <>
  
  
  <ToastContainer containerId={"adminResetPage"}/>



  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-8 py-10 text-center">
          <div className="flex justify-center mb-6">
      <img
           src={logo}
        alt="Company Logo"
        className="w-24 h-24 rounded-full shadow-md object-cover ring-4 ring-white bg-white"
      />
    </div>
            <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-purple-100 text-sm">Enter your details to reset your password</p>
          </div>

          <div className="px-8 py-10">
          <Link to='/'>
           
            <button 
             
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>
</Link>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({...errors, email: ''});
                    }}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                    placeholder="admin@example.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) setErrors({...errors, newPassword: ''});
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.newPassword && <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isLoading
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:from-purple-700 hover:to-purple-900 transform hover:scale-[1.02]'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                🔒 Password must be at least 8 characters long.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white text-sm mt-6 opacity-75">
          © 2025 Admin Panel. All rights reserved.
        </p>
      </div>
    </div>
  </>
  );
}

export default SuperAdminReset;