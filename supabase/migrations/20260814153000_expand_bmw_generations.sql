alter table public.vehicles
  drop constraint if exists vehicles_model_check,
  drop constraint if exists vehicles_model_year_check,
  drop constraint if exists vehicles_trim_check,
  drop constraint if exists vehicles_engine_code_check,
  drop constraint if exists vehicles_drivetrain_check,
  drop constraint if exists vehicles_transmission_check;

alter table public.vehicles
  alter column nickname set default 'My BMW';

alter table public.vehicles
  add constraint vehicles_supported_bmw_fitment check (
    (
      model = '3 Series (F30)'
      and model_year between 2012 and 2018
      and drivetrain in ('RWD', 'xDrive')
      and transmission in ('8-speed automatic', '6-speed manual')
      and (
        (trim = '320i' and engine_code = 'N20' and model_year between 2013 and 2018)
        or (trim = '328i' and engine_code in ('N20', 'N26') and model_year between 2012 and 2016 and (drivetrain = 'RWD' or transmission = '8-speed automatic'))
        or (trim = '328d' and engine_code = 'N47T' and model_year between 2014 and 2018 and transmission = '8-speed automatic')
        or (trim = '330e' and engine_code = 'B48-PHEV' and model_year between 2016 and 2018 and drivetrain = 'RWD' and transmission = '8-speed automatic')
        or (trim = '330i' and engine_code = 'B46' and model_year between 2017 and 2018 and (drivetrain = 'RWD' or transmission = '8-speed automatic'))
        or (trim = '335i' and engine_code = 'N55' and model_year between 2012 and 2015)
        or (trim = '340i' and engine_code = 'B58' and model_year between 2016 and 2018)
      )
    )
    or
    (
      model = '3 Series (E36)'
      and model_year between 1992 and 1999
      and drivetrain = 'RWD'
      and (
        (
          trim in ('318i', '318is', '318ic', '318ti')
          and engine_code in ('M42', 'M44')
          and transmission in ('5-speed manual', '4-speed automatic')
          and ((engine_code = 'M42' and model_year between 1992 and 1995) or (engine_code = 'M44' and model_year between 1996 and 1999))
        )
        or (
          trim in ('325i', '325is', '325ic')
          and engine_code in ('M50-NV', 'M50TU')
          and model_year between 1992 and 1995
          and transmission in ('5-speed manual', '4-speed automatic')
        )
        or (
          trim in ('323i', '323is', '323ic')
          and engine_code = 'M52B25'
          and model_year between 1998 and 1999
          and transmission in ('5-speed manual', '4-speed automatic')
        )
        or (
          trim in ('328i', '328is', '328ic')
          and engine_code = 'M52B28'
          and model_year between 1996 and 1999
          and transmission in ('5-speed manual', '4-speed automatic')
        )
        or (
          trim = 'M3'
          and engine_code in ('S50US', 'S52US')
          and transmission in ('5-speed manual', '5-speed automatic')
          and ((engine_code = 'S50US' and model_year = 1995) or (engine_code = 'S52US' and model_year between 1996 and 1999))
        )
      )
    )
  );
