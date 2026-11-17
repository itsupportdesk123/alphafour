import { Download, Images } from 'lucide-react';
import { lazy, Suspense, useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { SmartImage } from '@/components/common/SmartImage';
import { ConsentCheckbox, Field, Honeypot } from '@/components/forms/Field';
import { useLeadForm } from '@/components/forms/useLeadForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatINR } from '@/lib/format';
import { unsplash } from '@/lib/media';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { brochureKey } from '@/features/residences/brochure';

const GalleryLightbox = lazy(() => import('@/features/gallery/GalleryLightbox'));

/** Five-photo mosaic opening into the full-screen lightbox. */
export function PhotoMosaic({ residence }) {
  const [index, setIndex] = useState(-1);
  const slides = useMemo(
    () => residence.images.map((photo, i) => ({ src: unsplash(photo, { w: 2200, q: 80 }), alt: `${residence.name}, photo ${i + 1}`, title: residence.name })),
    [residence],
  );
  const [first, ...rest] = residence.images;
  // Two photos share the width; the large-plus-small layout needs more to fill its grid.
  const pair = rest.length === 1;
  return (
    <>
      <div className={cn('grid gap-3 md:h-[34rem]', pair ? 'md:grid-cols-2' : 'md:grid-cols-4 md:grid-rows-2')}>
        <button type="button" onClick={() => setIndex(0)} className={cn('group relative overflow-hidden rounded-[1.75rem]', !pair && 'md:col-span-2 md:row-span-2')} data-cursor="View" aria-label="Open photo gallery">
          <SmartImage photo={first} alt={`${residence.name} exterior`} className="h-72 md:h-full" sizes="(min-width: 768px) 50vw, 100vw" priority imgClassName="transition-transform [transition-duration:1400ms] ease-luxe group-hover:scale-105" />
        </button>
        {rest.slice(0, 4).map((photo, i) => (
          <button key={photo} type="button" onClick={() => setIndex(i + 1)} className={cn('group relative hidden overflow-hidden md:block', pair ? 'rounded-[1.75rem]' : 'rounded-[1.25rem]')} data-cursor="View" aria-label={`Open photo ${i + 2}`}>
            <SmartImage photo={photo} alt={`${residence.name}, photo ${i + 2}`} className="h-full" sizes="25vw" widths={[480, 768]} imgClassName="transition-transform [transition-duration:1400ms] ease-luxe group-hover:scale-105" />
            {i === 3 && (
              <span className="absolute inset-0 flex items-center justify-center gap-2 bg-navy/55 text-sm font-semibold uppercase tracking-[0.18em] text-ivory backdrop-blur-[2px]">
                <Images className="size-4" aria-hidden /> All {residence.images.length} photos
              </span>
            )}
          </button>
        ))}
      </div>
      {index >= 0 && (
        <Suspense fallback={null}>
          <GalleryLightbox slides={slides} index={index} onClose={() => setIndex(-1)} />
        </Suspense>
      )}
    </>
  );
}

const brochureSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z.string().trim().regex(/^\+?[0-9\s\-().]{7,20}$/, 'Please enter a valid phone number'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the privacy policy to continue' }) }),
  company: z.string().optional(),
});



/** Lead-gated brochure: the request is emailed to sales, then the printable brochure opens. */
export function BrochureForm({ residence, onDone }) {
  const uid = useId();
  const { form, onSubmit, submitting } = useLeadForm({
    schema: brochureSchema,
    defaultValues: { name: '', email: '', phone: '', consent: false, company: '' },
    send: async (values) => {
      const response = await api.sendEnquiry({
        ...values,
        residence: residence.name,
        subject: 'Brochure request',
        message: `Please share the brochure and price list for ${residence.name}.`,
      });
      try {
        sessionStorage.setItem(brochureKey(residence.slug), '1');
      } catch {
        /* storage blocked: the brochure still opens for this navigation */
      }
      onDone?.();
      return response;
    },
    source: `residence/${residence.slug}/brochure`,
    successTitle: 'Brochure unlocked',
  });
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5">
      <Honeypot register={register} />
      <Field id={`${uid}-name`} label="Full name" error={errors.name?.message}>
        {(a) => <Input autoComplete="name" {...a} {...register('name')} />}
      </Field>
      <Field id={`${uid}-email`} label="Email" error={errors.email?.message}>
        {(a) => <Input type="email" autoComplete="email" {...a} {...register('email')} />}
      </Field>
      <Field id={`${uid}-phone`} label="Phone" error={errors.phone?.message}>
        {(a) => <Input type="tel" autoComplete="tel" {...a} {...register('phone')} />}
      </Field>
      <ConsentCheckbox id={`${uid}-consent`} register={register} error={errors.consent?.message} />
      <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
        <Download aria-hidden /> {submitting ? 'Unlocking…' : 'Get the brochure'}
      </Button>
    </form>
  );
}

export function BrochureDialog({ residence, open, onOpenChange }) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download the brochure</DialogTitle>
          <DialogDescription>Specifications and pricing details for {residence.name}, plus a copy in your inbox.</DialogDescription>
        </DialogHeader>
        <BrochureForm
          residence={residence}
          onDone={() => {
            onOpenChange(false);
            navigate(`/residences/${residence.slug}/brochure`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export function PriceBreakdown({ items }) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-gold/20">
      <table className="w-full text-sm">
        <caption className="sr-only">Indicative cost sheet</caption>
        <tbody>
          {items.map((item) => (
            <tr key={item.label} className="border-b border-gold/10">
              <th scope="row" className="px-5 py-3.5 text-left font-medium">
                {item.label}
              </th>
              <td className="px-5 py-3.5 text-right tabular-nums">{item.amount ? formatINR(item.amount, { compact: false }) : '—'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-royal-night text-ivory">
            <th scope="row" className="px-5 py-4 text-left font-semibold">
              All-inclusive (indicative)
            </th>
            <td className="px-5 py-4 text-right font-display text-xl text-gold">{formatINR(total, { compact: false })}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
