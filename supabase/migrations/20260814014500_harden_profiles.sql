alter table public.profiles
  add constraint profiles_display_name_length
  check (
    display_name is null
    or char_length(btrim(display_name)) between 1 and 60
  );
