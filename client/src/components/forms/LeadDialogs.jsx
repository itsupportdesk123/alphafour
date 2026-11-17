import { CallbackForm, EnquiryForm, SiteVisitForm } from '@/components/forms/LeadForms';
import { Eyebrow } from '@/components/common/Section';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUiStore } from '@/store/ui';

const COPY = {
  enquiry: {
    eyebrow: 'Private enquiry',
    title: 'Speak with an advisor',
    description: 'Share a few details and a dedicated advisor will be in touch within one business day.',
  },
  'site-visit': {
    eyebrow: 'Private viewing',
    title: 'Book a private viewing',
    description: 'Choose a date and time. Your advisor will call to confirm and arrange valet on arrival.',
  },
  callback: {
    eyebrow: 'Call-back',
    title: 'We’ll call you',
    description: 'Leave your number and the best time to reach you.',
  },
};

/** One dialog host for every lead form, driven by the global UI store. */
export function LeadDialogs() {
  const { dialog, context, closeDialog } = useUiStore();
  const copy = dialog ? COPY[dialog] : null;

  return (
    <Dialog open={Boolean(dialog)} onOpenChange={(open) => !open && closeDialog()}>
      {copy && (
        <DialogContent className={dialog === 'site-visit' ? 'max-w-2xl' : undefined}>
          <DialogHeader>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <DialogTitle className="pt-3">{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          {dialog === 'enquiry' && <EnquiryForm defaultResidence={context.residence} source={context.source ?? 'dialog/enquiry'} />}
          {dialog === 'site-visit' && <SiteVisitForm defaultResidence={context.residence} source={context.source ?? 'dialog/site-visit'} />}
          {dialog === 'callback' && <CallbackForm defaultResidence={context.residence} source={context.source ?? 'dialog/callback'} />}
        </DialogContent>
      )}
    </Dialog>
  );
}
