-- REVIEW DECISION: extend only the bounded vehicle-fitment constraint; the existing owner-only RLS policies are intentionally unchanged.
alter table public.vehicles
  drop constraint if exists vehicles_supported_bmw_fitment;

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
      model = '3 Series (E46)'
      and model_year between 1999 and 2006
      and transmission in ('5-speed manual', '6-speed manual', '5-speed automatic', '6-speed SMG II')
      and (
        (trim = '323i' and model_year between 1999 and 2000 and engine_code = 'M52TUB25' and drivetrain = 'RWD' and transmission in ('5-speed manual', '5-speed automatic'))
        or (trim in ('323Ci', '323iT') and model_year = 2000 and engine_code = 'M52TUB25' and drivetrain = 'RWD' and transmission in ('5-speed manual', '5-speed automatic'))
        or (trim = '323Cic' and model_year = 2000 and engine_code = 'M52TUB25' and drivetrain = 'RWD' and transmission = '5-speed automatic')
        or (trim = '328i' and model_year between 1999 and 2000 and engine_code = 'M52TUB28' and drivetrain = 'RWD' and transmission in ('5-speed manual', '5-speed automatic'))
        or (trim = '328Ci' and model_year = 2000 and engine_code = 'M52TUB28' and drivetrain = 'RWD' and transmission in ('5-speed manual', '5-speed automatic'))
        or (
          trim in ('325i', '325Ci', '325Cic', '325iT')
          and drivetrain = 'RWD'
          and ((trim in ('325i', '325iT') and model_year between 2001 and 2005) or (trim in ('325Ci', '325Cic') and model_year between 2001 and 2006))
          and (
            (engine_code = 'M54B25' and transmission in ('5-speed manual', '5-speed automatic'))
            or (engine_code = 'M56B25' and model_year between 2003 and 2006 and transmission = '5-speed automatic')
          )
        )
        or (trim in ('325xi', '325xiT') and model_year between 2001 and 2005 and engine_code = 'M54B25' and drivetrain = 'AWD' and transmission in ('5-speed manual', '5-speed automatic'))
        or (
          trim in ('330i', '330Ci', '330Cic')
          and drivetrain = 'RWD'
          and engine_code = 'M54B30'
          and ((trim = '330i' and model_year between 2001 and 2005) or (trim in ('330Ci', '330Cic') and model_year between 2001 and 2006))
          and (transmission = '5-speed automatic' or (model_year <= 2003 and transmission = '5-speed manual') or (model_year >= 2004 and transmission = '6-speed manual'))
        )
        or (
          trim = '330xi'
          and model_year between 2001 and 2005
          and engine_code = 'M54B30'
          and drivetrain = 'AWD'
          and (transmission = '5-speed automatic' or (model_year <= 2003 and transmission = '5-speed manual') or (model_year >= 2004 and transmission = '6-speed manual'))
        )
        or (trim = 'M3' and model_year between 2001 and 2006 and engine_code = 'S54B32' and drivetrain = 'RWD' and transmission in ('6-speed manual', '6-speed SMG II'))
      )
    )
    or
    (
      model = '5 Series (E39)'
      and model_year between 1997 and 2003
      and drivetrain = 'RWD'
      and (
        (
          trim = '528i'
          and model_year between 1997 and 2000
          and ((model_year <= 1998 and engine_code = 'M52B28' and transmission in ('5-speed manual', '4-speed automatic')) or (model_year >= 1999 and engine_code = 'M52TUB28' and transmission in ('5-speed manual', '5-speed automatic')))
        )
        or (trim = '528iT' and model_year between 1999 and 2000 and engine_code = 'M52TUB28' and transmission in ('5-speed manual', '5-speed automatic'))
        or (trim in ('525i', '525iT') and model_year between 2001 and 2003 and engine_code = 'M54B25' and transmission in ('5-speed manual', '5-speed automatic'))
        or (trim = '530i' and model_year between 2001 and 2003 and engine_code = 'M54B30' and transmission in ('5-speed manual', '5-speed automatic'))
        or (
          trim = '540i'
          and model_year between 1997 and 2003
          and transmission in ('6-speed manual', '5-speed automatic')
          and ((model_year <= 1998 and engine_code = 'M62B44') or (model_year >= 1999 and engine_code = 'M62TUB44'))
        )
        or (
          trim = '540iT'
          and model_year between 1997 and 2003
          and transmission = '5-speed automatic'
          and ((model_year <= 1998 and engine_code = 'M62B44') or (model_year >= 1999 and engine_code = 'M62TUB44'))
        )
        or (trim = 'M5' and model_year between 2000 and 2003 and engine_code = 'S62B50' and transmission = '6-speed manual')
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
