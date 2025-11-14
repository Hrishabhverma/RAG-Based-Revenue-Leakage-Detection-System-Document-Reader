import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in
    setVisible(true);

    // Set timeout to fade out and then call onClose
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade out transition
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className={`fixed top-5 right-5 z-50 transition-all duration-300 ease-in-out ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
        <div className="bg-green-600/90 backdrop-blur-sm text-white font-semibold py-3 px-5 rounded-lg shadow-2xl border border-green-500 flex items-center space-x-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>{message}</span>
            <button onClick={onClose} className="text-green-200 hover:text-white">&times;</button>
        </div>
    </div>
  );
};
