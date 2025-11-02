import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { InsertContactInquiry } from '@shared/schema';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: 'general' | 'investor';
}

export default function ContactModal({ open, onOpenChange, type = 'general' }: ContactModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Reset form and set subject when modal opens or type changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: type === 'investor' ? 'Investment Inquiry' : '',
        message: ''
      });
    }
  }, [open, type]);

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContactInquiry) => {
      return await apiRequest('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contactData: InsertContactInquiry = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      subject: formData.subject,
      message: formData.message,
      type: type,
    };

    contactMutation.mutate(contactData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {type === 'investor' ? 'Investment Inquiry' : 'Contact Us'}
          </DialogTitle>
          <DialogDescription>
            {type === 'investor' 
              ? 'Fill out the form below and we\'ll send you our investment proposal.'
              : 'Get in touch with us. We\'d love to hear from you!'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="John Doe"
              data-testid="input-contact-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="john@example.com"
              data-testid="input-contact-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+234 800 000 0000"
              data-testid="input-contact-phone"
            />
          </div>

          {type !== 'investor' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder="What is this regarding?"
                data-testid="input-contact-subject"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              placeholder={type === 'investor' 
                ? "Tell us about your investment interest and we'll send you our detailed proposal..."
                : "Your message here..."}
              rows={5}
              data-testid="input-contact-message"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={contactMutation.isPending}
              className="flex-1"
              data-testid="button-submit-contact"
            >
              <Send className="w-4 h-4 mr-2" />
              {contactMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-contact"
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="border-t pt-4 mt-4 space-y-3">
          <h4 className="font-semibold text-sm">Other Ways to Reach Us:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>info@afribet.com</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>+234 800 AFRIBET</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Lagos, Nigeria</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
