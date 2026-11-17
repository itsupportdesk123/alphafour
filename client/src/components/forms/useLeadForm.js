import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { compact } from '@/components/forms/schemas';

/**
 * Shared form state for every lead form: validation, submission, server field
 * errors, success receipt and toasts.
 */
export function useLeadForm({ schema, defaultValues, send, source, transform = (v) => v, successTitle }) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues, mode: 'onTouched' });
  const [result, setResult] = useState(null);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = compact({ ...transform(values), source });
      const response = await send(payload);
      setResult({ message: response.message, reference: response.data?.reference });
      toast.success(successTitle ?? 'Thank you', { description: response.message });
    } catch (error) {
      const fieldErrors = error?.fieldErrors ?? [];
      fieldErrors.forEach(({ field, message }) => {
        if (field in values) form.setError(field, { type: 'server', message });
      });
      toast.error('We couldn’t send that just yet', {
        description: error?.message ?? 'Please try again in a moment.',
      });
    }
  });

  const reset = () => {
    setResult(null);
    form.reset(defaultValues);
  };

  return { form, onSubmit, result, reset, submitting: form.formState.isSubmitting };
}
