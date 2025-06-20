import React, { useEffect } from "react";
import ReactDOM from "react-dom";

interface AdminModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function AdminModal({ children, onClose }: AdminModalProps) {
  // Optional: Disable background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        
        {children}
      </div>
    </div>,
    document.body
  );
}

