import * as TabsPrimitive from '@radix-ui/react-tabs';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn('glass inline-flex flex-wrap items-center gap-1 rounded-full p-1.5', className)}
      {...props}
    />
  );
});

export const TabsTrigger = forwardRef(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full px-5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-all duration-500 ease-luxe hover:text-gold-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-gold-foil data-[state=active]:text-navy data-[state=active]:shadow-gold-glow dark:hover:text-gold',
        className,
      )}
      {...props}
    />
  );
});

export const TabsContent = forwardRef(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn('mt-8 focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0', className)}
      {...props}
    />
  );
});
