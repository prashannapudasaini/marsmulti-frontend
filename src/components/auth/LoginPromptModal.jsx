import React from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useCart } from "../../hooks/useCart";

export function LoginPromptModal() {
  const { isLoginPromptOpen, setIsLoginPromptOpen } = useCart();

  const handleLogin = () => {
    setIsLoginPromptOpen(false);
    window.location.href = "/login";
  };

  return (
    <Modal
      isOpen={isLoginPromptOpen}
      onClose={() => setIsLoginPromptOpen(false)}
      title="Authentication Required"
      subtitle="Please login to order"
      className="max-w-md text-center"
    >
      <div className="flex flex-col items-center space-y-6 pt-4 pb-2">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-3xl font-bold">
          🔒
        </div>
        <p className="text-zinc-600 text-sm leading-relaxed">
          You need to be logged in to your account in order to checkout and place an order.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Button 
            variant="ghost" 
            onClick={() => setIsLoginPromptOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleLogin}
            className="w-full sm:w-auto !bg-[#7b1113] hover:!bg-[#600d0f]"
          >
            OK, Go to Login
          </Button>
        </div>
      </div>
    </Modal>
  );
}
