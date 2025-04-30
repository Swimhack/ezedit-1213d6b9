
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function EmailSubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: EmailFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabase.auth.session()?.access_token}`
        },
        body: JSON.stringify({
          to: data.email,
          subject: "Thanks for your interest in EzEdit.co!",
          text: `Hello,\n\nThank you for your interest in EzEdit.co! We'll send you an invite soon.\n\nBest regards,\nThe EzEdit Team`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Thanks for your interest in EzEdit.co!</h2>
              <p>We've received your email and will send you an invite soon.</p>
              <p>In the meantime, feel free to explore our <a href="https://ezedit.co/features" style="color: #0070f3; text-decoration: none;">features</a>.</p>
              <p style="margin-top: 20px;">Best regards,<br>The EzEdit Team</p>
            </div>
          `
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast.success("Thanks! We'll send you an invite soon.");
      form.reset();
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to submit. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      placeholder="Enter your email" 
                      {...field} 
                      className="h-12"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <Button 
                    type="submit" 
                    className="bg-ezblue text-eznavy hover:bg-ezblue-light h-12" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Get Invite <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}

export default EmailSubmissionForm;
