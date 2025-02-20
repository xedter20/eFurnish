import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const CustomAlert = ({ message, type }) => {
  const alertStyles = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-base-light text-black border-base-dark',
  };

  const iconStyles = {
    success: <CheckCircle className="text-green-800" />,
    error: <AlertCircle className="text-red-800" />,
    warning: <AlertTriangle className="text-yellow-800" />,
    info: <Info className="text-black" />,
  };

  return (
    <div className={`flex items-center border-l-4 p-4 ${alertStyles[type]} rounded-md shadow-md`}>
      <div className="mr-3">{iconStyles[type]}</div>
      <p>{message}</p>
    </div>
  );
};

export default CustomAlert; 