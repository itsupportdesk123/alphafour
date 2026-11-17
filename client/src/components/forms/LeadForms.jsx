import { Minus, Plus, Send, Star } from 'lucide-react';
import { useId, useState } from 'react';
import { Controller } from 'react-hook-form';
import { ChipGroup, DatePicker } from '@/components/forms/DatePicker';
import { ConsentCheckbox, Field, Honeypot } from '@/components/forms/Field';
import { FormSuccess } from '@/components/forms/FormSuccess';
import {
  BUDGETS,
  CALLBACK_TIMES,
  FEEDBACK_TOPICS,
  SITE_VISIT_SLOTS,
  callbackSchema,
  enquirySchema,
  feedbackSchema,
  newsletterSchema,
  siteVisitSchema,
} from '@/components/forms/schemas';
import { useLeadForm } from '@/components/forms/useLeadForm';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { site } from '@/config/site';
import { RESIDENCES } from '@/data/residences';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

const RESIDENCE_OPTIONS = [
  ...RESIDENCES.filter((r) => r.status !== 'sold-out').map((r) => ({ value: r.name, label: `${r.name} · ${r.city}` })),
  { value: 'Not sure yet', label: 'Not sure yet, please advise' },
];

function SubmitButton({ submitting, children }) {
  return (
    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting} aria-busy={submitting}>
      {submitting ? 'Sending…' : children}
      {!submitting && <Send aria-hidden />}
    </Button>
  );
}

/* ───────────────────────────── Enquiry ───────────────────────────── */
export function EnquiryForm({ tone = 'light', defaultResidence, source = 'website/enquiry', compact = false, className }) {
  const uid = useId();
  const { form, onSubmit, result, reset, submitting } = useLeadForm({
    schema: enquirySchema,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      residence: defaultResidence ?? '',
      budget: '',
      message: defaultResidence ? `I would like to know more about ${defaultResidence}.` : '',
      consent: false,
      company: '',
    },
    send: api.sendEnquiry,
    source,
    successTitle: 'Enquiry received',
  });
  const { register, control, formState: { errors } } = form;

  if (result) return <FormSuccess title="Thank you" message={result.message} reference={result.reference} onReset={reset} />;

  return (
    <form onSubmit={onSubmit} noValidate className={cn('relative grid gap-5', className)}>
      <Honeypot register={register} />
      <div className={cn('grid gap-5', !compact && 'sm:grid-cols-2')}>
        <Field id={`${uid}-name`} label="Full name" error={errors.name?.message}>
          {(a) => <Input tone={tone} autoComplete="name" placeholder="Your name" {...a} {...register('name')} />}
        </Field>
        <Field id={`${uid}-phone`} label="Phone" error={errors.phone?.message}>
          {(a) => <Input tone={tone} type="tel" autoComplete="tel" placeholder="+91 98200 00000" {...a} {...register('phone')} />}
        </Field>
      </div>
      <Field id={`${uid}-email`} label="Email" error={errors.email?.message}>
        {(a) => <Input tone={tone} type="email" autoComplete="email" placeholder="you@example.com" {...a} {...register('email')} />}
      </Field>
      {!compact && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={`${uid}-residence`} label="Project" optional>
            {(a) => (
              <Controller
                control={control}
                name="residence"
                render={({ field }) => (
                  <Select tone={tone} options={RESIDENCE_OPTIONS} placeholder="Choose a project" value={field.value || undefined} onValueChange={field.onChange} {...a} />
                )}
              />
            )}
          </Field>
          <Field id={`${uid}-budget`} label="Budget" optional>
            {(a) => (
              <Controller
                control={control}
                name="budget"
                render={({ field }) => (
                  <Select tone={tone} options={BUDGETS} placeholder="Select a range" value={field.value || undefined} onValueChange={field.onChange} {...a} />
                )}
              />
            )}
          </Field>
        </div>
      )}
      <Field id={`${uid}-message`} label="Message" error={errors.message?.message}>
        {(a) => <Textarea tone={tone} rows={compact ? 3 : 4} placeholder="Tell us what you are looking for…" {...a} {...register('message')} />}
      </Field>
      <ConsentCheckbox id={`${uid}-consent`} register={register} error={errors.consent?.message} tone={tone} />
      <div>
        <SubmitButton submitting={submitting}>Send enquiry</SubmitButton>
      </div>
    </form>
  );
}

/* ───────────────────────────── Site visit ───────────────────────────── */
export function SiteVisitForm({ tone = 'light', defaultResidence, source = 'website/site-visit', className }) {
  const uid = useId();
  const { form, onSubmit, result, reset, submitting } = useLeadForm({
    schema: siteVisitSchema,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      residence: defaultResidence ?? 'Alphafour Altitude',
      date: '',
      time: '',
      guests: 2,
      message: '',
      consent: false,
      company: '',
    },
    send: api.requestSiteVisit,
    source,
    successTitle: 'Viewing requested',
  });
  const { register, control, formState: { errors } } = form;

  if (result) {
    return <FormSuccess title="Your viewing is requested" message={result.message} reference={result.reference} onReset={reset} resetLabel="Book another visit" />;
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn('relative grid gap-5', className)}>
      <Honeypot register={register} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${uid}-date`} label="Preferred date" error={errors.date?.message}>
          {(a) => (
            <Controller control={control} name="date" render={({ field }) => <DatePicker tone={tone} value={field.value} onChange={field.onChange} {...a} />} />
          )}
        </Field>
        <Field id={`${uid}-residence`} label="Project">
          {(a) => (
            <Controller
              control={control}
              name="residence"
              render={({ field }) => <Select tone={tone} options={RESIDENCE_OPTIONS} value={field.value || undefined} onValueChange={field.onChange} {...a} />}
            />
          )}
        </Field>
      </div>
      <Field id={`${uid}-time`} label="Time slot (IST)" error={errors.time?.message}>
        {() => (
          <Controller
            control={control}
            name="time"
            render={({ field }) => <ChipGroup id={`${uid}-time`} label="Time slot" tone={tone} options={SITE_VISIT_SLOTS} value={field.value} onChange={field.onChange} />}
          />
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${uid}-name`} label="Full name" error={errors.name?.message}>
          {(a) => <Input tone={tone} autoComplete="name" placeholder="Your name" {...a} {...register('name')} />}
        </Field>
        <Field id={`${uid}-phone`} label="Phone" error={errors.phone?.message}>
          {(a) => <Input tone={tone} type="tel" autoComplete="tel" placeholder="+91 98200 00000" {...a} {...register('phone')} />}
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <Field id={`${uid}-email`} label="Email" error={errors.email?.message}>
          {(a) => <Input tone={tone} type="email" autoComplete="email" placeholder="you@example.com" {...a} {...register('email')} />}
        </Field>
        <Field id={`${uid}-guests`} label="Guests">
          {() => (
            <Controller
              control={control}
              name="guests"
              render={({ field }) => (
                <div className={cn('flex h-12 items-center gap-2 rounded-xl border px-2', tone === 'dark' ? 'border-white/15' : 'border-input')}>
                  <button type="button" aria-label="Fewer guests" className="inline-flex size-8 items-center justify-center rounded-full hover:bg-gold/15" onClick={() => field.onChange(Math.max(1, field.value - 1))}>
                    <Minus className="size-4" aria-hidden />
                  </button>
                  <output aria-live="polite" className="w-8 text-center font-semibold">{field.value}</output>
                  <button type="button" aria-label="More guests" className="inline-flex size-8 items-center justify-center rounded-full hover:bg-gold/15" onClick={() => field.onChange(Math.min(10, field.value + 1))}>
                    <Plus className="size-4" aria-hidden />
                  </button>
                </div>
              )}
            />
          )}
        </Field>
      </div>
      <ConsentCheckbox id={`${uid}-consent`} register={register} error={errors.consent?.message} tone={tone} />
      <div>
        <SubmitButton submitting={submitting}>Request private viewing</SubmitButton>
      </div>
    </form>
  );
}

/* ───────────────────────────── Call-back ───────────────────────────── */
export function CallbackForm({ tone = 'light', defaultResidence, source = 'website/callback', className }) {
  const uid = useId();
  const { form, onSubmit, result, reset, submitting } = useLeadForm({
    schema: callbackSchema,
    defaultValues: { name: '', phone: '', email: '', preferredTime: 'asap', residence: defaultResidence ?? '', consent: false, company: '' },
    send: api.requestCallback,
    source,
    successTitle: 'Call-back requested',
  });
  const { register, control, formState: { errors } } = form;

  if (result) return <FormSuccess title="We’ll call you shortly" message={result.message} reference={result.reference} onReset={reset} />;

  return (
    <form onSubmit={onSubmit} noValidate className={cn('relative grid gap-5', className)}>
      <Honeypot register={register} />
      <Field id={`${uid}-name`} label="Full name" error={errors.name?.message}>
        {(a) => <Input tone={tone} autoComplete="name" placeholder="Your name" {...a} {...register('name')} />}
      </Field>
      <Field id={`${uid}-phone`} label="Phone" error={errors.phone?.message}>
        {(a) => <Input tone={tone} type="tel" autoComplete="tel" placeholder="+91 98200 00000" {...a} {...register('phone')} />}
      </Field>
      <Field id={`${uid}-email`} label="Email" optional error={errors.email?.message} hint="We’ll send a confirmation if you add one.">
        {(a) => <Input tone={tone} type="email" autoComplete="email" placeholder="you@example.com" {...a} {...register('email')} />}
      </Field>
      <Field id={`${uid}-time`} label="Best time to call">
        {() => (
          <Controller
            control={control}
            name="preferredTime"
            render={({ field }) => <ChipGroup id={`${uid}-time`} label="Best time to call" tone={tone} options={CALLBACK_TIMES} value={field.value} onChange={field.onChange} />}
          />
        )}
      </Field>
      <ConsentCheckbox id={`${uid}-consent`} register={register} error={errors.consent?.message} tone={tone} />
      <div>
        <SubmitButton submitting={submitting}>Call me back</SubmitButton>
      </div>
    </form>
  );
}

/* ───────────────────────────── Feedback ───────────────────────────── */
function RatingInput({ id, value, onChange }) {
  const [hover, setHover] = useState(0);
  const labels = ['Disappointing', 'Below expectations', 'Good', 'Very good', 'Exceptional'];
  const shown = hover || value;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div id={id} role="radiogroup" aria-label="Rating" className="flex gap-1" onPointerLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}: ${labels[n - 1]}`}
            onPointerEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="rounded-full p-1 transition-transform duration-300 hover:scale-110"
          >
            <Star className={cn('size-8 transition-colors', n <= shown ? 'fill-gold text-gold' : 'text-gold/40')} strokeWidth={1.25} aria-hidden />
          </button>
        ))}
      </div>
      <span className="text-sm opacity-80" aria-live="polite">{shown ? labels[shown - 1] : 'Tap a star'}</span>
    </div>
  );
}

export function FeedbackForm({ tone = 'light', source = 'website/feedback', className }) {
  const uid = useId();
  const { form, onSubmit, result, reset, submitting } = useLeadForm({
    schema: feedbackSchema,
    defaultValues: { rating: 0, topic: 'overall', name: '', email: '', message: '', recommend: '', allowTestimonial: false, company: '' },
    send: api.sendFeedback,
    source,
    successTitle: 'Feedback received',
    transform: (values) => ({
      ...values,
      recommend: values.recommend === '' ? undefined : values.recommend === 'yes',
    }),
  });
  const { register, control, formState: { errors } } = form;

  if (result) return <FormSuccess title="Thank you for your feedback" message={result.message} reference={result.reference} onReset={reset} resetLabel="Share more feedback" />;

  return (
    <form onSubmit={onSubmit} noValidate className={cn('relative grid gap-6', className)}>
      <Honeypot register={register} />
      <Field id={`${uid}-rating`} label="How was your experience?" error={errors.rating?.message}>
        {() => <Controller control={control} name="rating" render={({ field }) => <RatingInput id={`${uid}-rating`} value={field.value} onChange={field.onChange} />} />}
      </Field>
      <Field id={`${uid}-topic`} label="About">
        {(a) => (
          <Controller control={control} name="topic" render={({ field }) => <Select tone={tone} options={FEEDBACK_TOPICS} value={field.value} onValueChange={field.onChange} {...a} />} />
        )}
      </Field>
      <Field id={`${uid}-message`} label="Your feedback" error={errors.message?.message}>
        {(a) => <Textarea tone={tone} rows={5} placeholder="What did we do well, and what could be better?" {...a} {...register('message')} />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${uid}-name`} label="Name" optional error={errors.name?.message}>
          {(a) => <Input tone={tone} autoComplete="name" {...a} {...register('name')} />}
        </Field>
        <Field id={`${uid}-email`} label="Email" optional error={errors.email?.message} hint="Add it if you’d like a reply.">
          {(a) => <Input tone={tone} type="email" autoComplete="email" {...a} {...register('email')} />}
        </Field>
      </div>
      <Field id={`${uid}-recommend`} label={`Would you recommend ${site.name}?`}>
        {() => (
          <Controller
            control={control}
            name="recommend"
            render={({ field }) => (
              <ChipGroup id={`${uid}-recommend`} label={`Would you recommend ${site.name}?`} tone={tone} value={field.value} onChange={field.onChange} options={[{ value: 'yes', label: 'Yes, gladly' }, { value: 'no', label: 'Not yet' }]} />
            )}
          />
        )}
      </Field>
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input type="checkbox" className="mt-0.5 size-4 accent-[#C9A24B]" {...register('allowTestimonial')} />
        <span className="opacity-80">You may feature my words (first name only) as a testimonial.</span>
      </label>
      <div>
        <SubmitButton submitting={submitting}>Send feedback</SubmitButton>
      </div>
    </form>
  );
}

/* ───────────────────────────── Newsletter ───────────────────────────── */
export function NewsletterForm({ tone = 'dark', source = 'website/newsletter', className }) {
  const uid = useId();
  const { form, onSubmit, result, submitting } = useLeadForm({
    schema: newsletterSchema,
    defaultValues: { email: '', company: '' },
    send: api.subscribe,
    source,
    successTitle: `Welcome to ${site.name}`,
  });
  const { register, formState: { errors } } = form;

  if (result) {
    return (
      <p role="status" className="flex items-center gap-3 rounded-full border border-gold/40 px-5 py-3 text-sm">
        <span aria-hidden className="size-2 rounded-full bg-gold" /> You’re on the list. Please check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn('relative', className)}>
      <Honeypot register={register} />
      <label htmlFor={`${uid}-email`} className="sr-only">Email address</label>
      <div className={cn('flex items-center gap-2 rounded-full border p-1.5 pl-5 transition-colors focus-within:border-gold', tone === 'dark' ? 'border-white/20 bg-white/[0.06]' : 'border-input bg-white/80 dark:bg-white/[0.06]')}>
        <input
          id={`${uid}-email`}
          type="email"
          autoComplete="email"
          placeholder="Your email address"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${uid}-error` : undefined}
          className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-60"
          {...register('email')}
        />
        <Button type="submit" size="sm" disabled={submitting} aria-busy={submitting}>
          {submitting ? 'Joining…' : 'Join'}
        </Button>
      </div>
      {errors.email && <p id={`${uid}-error`} className={cn('mt-2 pl-5 text-xs', tone === 'dark' ? 'text-[#FCA5A5]' : 'text-destructive')}>{errors.email.message}</p>}
    </form>
  );
}
