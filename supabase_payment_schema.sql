-- Create a table for storing customer payment methods
create table public.payment_methods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  stripe_payment_method_id text, -- unique id from stripe
  type text default 'card',
  brand text, -- visa, mastercard, etc.
  last4 text,
  expiry text, -- MM/YY
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.payment_methods enable row level security;

create policy "Users can view their own payment methods"
  on public.payment_methods for select
  using (auth.uid() = user_id);

create policy "Users can insert their own payment methods"
  on public.payment_methods for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own payment methods"
  on public.payment_methods for update
  using (auth.uid() = user_id);

create policy "Users can delete their own payment methods"
  on public.payment_methods for delete
  using (auth.uid() = user_id);
