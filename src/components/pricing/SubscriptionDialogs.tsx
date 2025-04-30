
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubscriptionDialogsProps {
  showSuccess: boolean;
  setShowSuccess: (value: boolean) => void;
  showCanceled: boolean;
  setShowCanceled: (value: boolean) => void;
}

export const SubscriptionDialogs = ({
  showSuccess,
  setShowSuccess,
  showCanceled,
  setShowCanceled
}: SubscriptionDialogsProps) => {
  return (
    <>
      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Successful!</DialogTitle>
            <DialogDescription>
              Thank you for subscribing to EzEdit Business Pro. Your payment was successful and your subscription is now active.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccess(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Canceled Dialog */}
      <Dialog open={showCanceled} onOpenChange={setShowCanceled}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Canceled</DialogTitle>
            <DialogDescription>
              Your subscription process was canceled. If you have any questions or need assistance, feel free to contact our support team.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowCanceled(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
