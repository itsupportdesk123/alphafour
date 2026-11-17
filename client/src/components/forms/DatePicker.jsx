import * as Popover from '@radix-ui/react-popover';
import { addDays, format, parseISO } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { fieldBase, fieldTone } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

const toIso = (date) => format(date, 'yyyy-MM-dd');

/** Date field with a luxury calendar popover. Value is a 'YYYY-MM-DD' string. */
export function DatePicker({ id, value, onChange, tone = 'light', minDays = 1, maxDays = 60, ...aria }) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(value) : undefined;
  const today = new Date();
  const fromDate = addDays(today, minDays);
  const toDate = addDays(today, maxDays);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          className={cn(fieldBase, fieldTone[tone], 'flex h-12 items-center justify-between gap-3 text-left')}
          {...aria}
        >
          <span className={cn(!selected && 'opacity-50')}>{selected ? format(selected, 'EEE, d MMM yyyy') : 'Choose a date'}</span>
          <CalendarDays className="size-4 text-gold" aria-hidden />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="start"
          className="z-[120] rounded-3xl border border-gold/25 bg-popover p-4 text-popover-foreground shadow-luxe data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) {
                onChange(toIso(date));
                setOpen(false);
              }
            }}
            fromDate={fromDate}
            toDate={toDate}
            defaultMonth={selected ?? fromDate}
            weekStartsOn={1}
            showOutsideDays
            classNames={{
              months: 'flex flex-col',
              month: 'space-y-4',
              caption: 'relative flex items-center justify-center pt-1',
              caption_label: 'font-display text-lg',
              nav: 'flex items-center',
              nav_button:
                'inline-flex size-8 items-center justify-center rounded-full border border-gold/30 transition-colors hover:bg-gold/15 disabled:opacity-30',
              nav_button_previous: 'absolute left-0',
              nav_button_next: 'absolute right-0',
              table: 'w-full border-collapse',
              head_row: 'flex',
              head_cell: 'w-10 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground',
              row: 'mt-1 flex w-full',
              cell: 'relative size-10 p-0 text-center text-sm',
              day: 'inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              day_selected: '!bg-gold-foil font-semibold !text-navy',
              day_today: 'border border-gold/60',
              day_outside: 'opacity-35',
              day_disabled: 'pointer-events-none opacity-25',
              day_hidden: 'invisible',
            }}
            components={{
              IconLeft: () => <ChevronLeft className="size-4" aria-hidden />,
              IconRight: () => <ChevronRight className="size-4" aria-hidden />,
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Accessible single-choice chip group (radio semantics). */
export function ChipGroup({ id, label, options, value, onChange, tone = 'light', className }) {
  return (
    <div id={id} role="radiogroup" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-10 rounded-full border px-4 text-xs font-semibold tracking-wide transition-all duration-300',
              active
                ? 'border-transparent bg-gold-foil text-navy shadow-gold-glow'
                : tone === 'dark'
                  ? 'border-white/20 text-ivory/85 hover:border-gold'
                  : 'border-input hover:border-gold',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
