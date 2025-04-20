
import React, { useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface PaymentNotificationProps {
  checkSubscription: () => void;
}

export const PaymentNotification: React.FC<PaymentNotificationProps> = ({ 
  checkSubscription 
}) => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const paymentSuccess = searchParams.get("payment_success");
    const paymentCanceled = searchParams.get("payment_canceled");
    
    if (paymentSuccess) {
      toast.success("Payment successful! You now have premium access.");
      checkSubscription();
    }
    
    if (paymentCanceled) {
      toast.error("Payment canceled. You can try again later.");
    }
  }, [searchParams, checkSubscription]);

  return null;
};
