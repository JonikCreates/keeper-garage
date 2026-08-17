-- REVIEW DECISION: the catalog remains allow-listed at the database boundary. This expands fitment without changing owner-only RLS or touching existing garage rows.
alter table public.vehicles
  drop constraint if exists vehicles_brand_check,
  drop constraint if exists vehicles_supported_bmw_fitment,
  drop constraint if exists vehicles_supported_fitment;

alter table public.vehicles alter column nickname set default 'My vehicle';

alter table public.vehicles
  add constraint vehicles_supported_fitment check (
    (brand = 'BMW' and (
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
    ))
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2006 and 2006 and trim = '325i / 330i' and engine_code = 'N52' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2006 and 2006 and trim = '325i / 330i' and engine_code = 'N52' and drivetrain = 'RWD' and transmission = '6-speed automatic')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2006 and 2006 and trim = '325i / 330i' and engine_code = 'N52' and drivetrain = 'xDrive' and transmission = '6-speed manual')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2006 and 2006 and trim = '325i / 330i' and engine_code = 'N52' and drivetrain = 'xDrive' and transmission = '6-speed automatic')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2007 and 2013 and trim = '328i' and engine_code = 'N52K' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2007 and 2013 and trim = '328i' and engine_code = 'N52K' and drivetrain = 'RWD' and transmission = '6-speed automatic')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2007 and 2012 and trim = '328i' and engine_code = 'N52K' and drivetrain = 'xDrive' and transmission = '6-speed manual')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2007 and 2012 and trim = '328i' and engine_code = 'N52K' and drivetrain = 'xDrive' and transmission = '6-speed automatic')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2006 and 2013 and trim = '328i — SULEV/PZEV' and engine_code = 'N51' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2006 and 2013 and trim = '328i — SULEV/PZEV' and engine_code = 'N51' and drivetrain = 'RWD' and transmission = '6-speed automatic')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2006 and 2013 and trim = '328i — SULEV/PZEV' and engine_code = 'N51' and drivetrain = 'xDrive' and transmission = '6-speed manual')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2006 and 2013 and trim = '328i — SULEV/PZEV' and engine_code = 'N51' and drivetrain = 'xDrive' and transmission = '6-speed automatic')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2007 and 2010 and trim = '335i' and engine_code = 'N54' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2007 and 2010 and trim = '335i' and engine_code = 'N54' and drivetrain = 'RWD' and transmission = '6-speed automatic')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2009 and 2010 and trim = '335i' and engine_code = 'N54' and drivetrain = 'xDrive' and transmission = '6-speed manual')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2009 and 2010 and trim = '335i' and engine_code = 'N54' and drivetrain = 'xDrive' and transmission = '6-speed automatic')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2011 and 2013 and trim = '335i' and engine_code = 'N55' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2011 and 2013 and trim = '335i' and engine_code = 'N55' and drivetrain = 'RWD' and transmission = '6-speed automatic')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2011 and 2012 and trim = '335i' and engine_code = 'N55' and drivetrain = 'xDrive' and transmission = '6-speed manual')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2011 and 2012 and trim = '335i' and engine_code = 'N55' and drivetrain = 'xDrive' and transmission = '6-speed automatic')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2011 and 2013 and trim = '335is' and engine_code = 'N54T' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2011 and 2013 and trim = '335is' and engine_code = 'N54T' and drivetrain = 'RWD' and transmission = '7-speed DCT')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2009 and 2011 and trim = '335d — Diesel' and engine_code = 'M57Y' and drivetrain = 'RWD' and transmission = 'ZF 6HP26TU 6-speed automatic')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2008 and 2013 and trim = 'M3' and engine_code = 'S65' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'BMW' and model = '3 Series / M3 (E9x)' and model_year between 2008 and 2013 and trim = 'M3' and engine_code = 'S65' and drivetrain = 'RWD' and transmission = '7-speed M DCT')
    or
    (brand = 'Subaru' and model = 'WRX / WRX STI (VA)' and model_year between 2015 and 2018 and trim = 'WRX' and engine_code = 'FA20DIT' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Subaru' and model = 'WRX / WRX STI (VA)' and model_year between 2015 and 2018 and trim = 'WRX' and engine_code = 'FA20DIT' and drivetrain = 'AWD' and transmission = 'Sport Lineartronic High-Torque CVT')
    or
    (brand = 'Subaru' and model = 'WRX / WRX STI (VA)' and model_year between 2019 and 2021 and trim = 'WRX' and engine_code = 'FA20DIT' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Subaru' and model = 'WRX / WRX STI (VA)' and model_year between 2019 and 2021 and trim = 'WRX' and engine_code = 'FA20DIT' and drivetrain = 'AWD' and transmission = 'Sport Lineartronic High-Torque CVT')
    or
    (brand = 'Subaru' and model = 'WRX / WRX STI (VA)' and model_year between 2015 and 2017 and trim = 'WRX STI' and engine_code = 'EJ257' and drivetrain = 'AWD' and transmission = 'STI 6-speed manual')
    or
    (brand = 'Subaru' and model = 'WRX / WRX STI (VA)' and model_year between 2018 and 2018 and trim = 'WRX STI' and engine_code = 'EJ257' and drivetrain = 'AWD' and transmission = 'STI 6-speed manual')
    or
    (brand = 'Subaru' and model = 'WRX / WRX STI (VA)' and model_year between 2019 and 2021 and trim = 'WRX STI' and engine_code = 'EJ257' and drivetrain = 'AWD' and transmission = 'STI 6-speed manual')
    or
    (brand = 'Subaru' and model = 'WRX / WRX STI (VA)' and model_year between 2018 and 2018 and trim = 'WRX STI Type RA' and engine_code = 'EJ257' and drivetrain = 'AWD' and transmission = 'STI 6-speed manual')
    or
    (brand = 'Subaru' and model = 'WRX / WRX STI (VA)' and model_year between 2019 and 2019 and trim = 'STI S209' and engine_code = 'EJ257' and drivetrain = 'AWD' and transmission = 'STI 6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (996.1)' and model_year between 1999 and 2001 and trim = 'Carrera 3.4' and engine_code = 'M96-3.4' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (996.1)' and model_year between 1999 and 2001 and trim = 'Carrera 3.4' and engine_code = 'M96-3.4' and drivetrain = 'RWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (996.1)' and model_year between 1999 and 2001 and trim = 'C4 3.4' and engine_code = 'M96-3.4' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (996.1)' and model_year between 1999 and 2001 and trim = 'C4 3.4' and engine_code = 'M96-3.4' and drivetrain = 'AWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (996.2)' and model_year between 2002 and 2004 and trim = 'Carrera 3.6' and engine_code = 'M96-3.6' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (996.2)' and model_year between 2002 and 2004 and trim = 'Carrera 3.6' and engine_code = 'M96-3.6' and drivetrain = 'RWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (996.2)' and model_year between 2002 and 2005 and trim = 'C4-C4S 3.6' and engine_code = 'M96-3.6' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (996.2)' and model_year between 2002 and 2005 and trim = 'C4-C4S 3.6' and engine_code = 'M96-3.6' and drivetrain = 'AWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (996.2)' and model_year between 2002 and 2004 and trim = 'Targa 3.6' and engine_code = 'M96-3.6' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (996.2)' and model_year between 2002 and 2004 and trim = 'Targa 3.6' and engine_code = 'M96-3.6' and drivetrain = 'RWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (996.2)' and model_year between 2001 and 2005 and trim = 'Turbo-TurboS' and engine_code = 'Mezger-Turbo' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (996.2)' and model_year between 2001 and 2005 and trim = 'Turbo-TurboS' and engine_code = 'Mezger-Turbo' and drivetrain = 'AWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (996.2)' and model_year between 2001 and 2005 and trim = 'GT2' and engine_code = 'Mezger-GT2' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (996.2)' and model_year between 2004 and 2005 and trim = 'GT3' and engine_code = 'Mezger-GT3' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2005 and 2008 and trim = 'Carrera 3.6' and engine_code = 'M96-M97 Carrera' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2005 and 2008 and trim = 'Carrera 3.6' and engine_code = 'M96-M97 Carrera' and drivetrain = 'RWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2005 and 2008 and trim = 'Carrera S 3.8' and engine_code = 'M96-M97 Carrera S' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2005 and 2008 and trim = 'Carrera S 3.8' and engine_code = 'M96-M97 Carrera S' and drivetrain = 'RWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2006 and 2008 and trim = 'Carrera 4 3.6' and engine_code = 'M96-M97 Carrera' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2006 and 2008 and trim = 'Carrera 4 3.6' and engine_code = 'M96-M97 Carrera' and drivetrain = 'AWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2006 and 2008 and trim = 'Carrera 4S 3.8' and engine_code = 'M96-M97 Carrera S' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2006 and 2008 and trim = 'Carrera 4S 3.8' and engine_code = 'M96-M97 Carrera S' and drivetrain = 'AWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2007 and 2008 and trim = 'Targa 4 3.6' and engine_code = 'M96-M97 Carrera' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2007 and 2008 and trim = 'Targa 4 3.6' and engine_code = 'M96-M97 Carrera' and drivetrain = 'AWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2007 and 2008 and trim = 'Targa 4S 3.8' and engine_code = 'M96-M97 Carrera S' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2007 and 2008 and trim = 'Targa 4S 3.8' and engine_code = 'M96-M97 Carrera S' and drivetrain = 'AWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2007 and 2009 and trim = 'Turbo 3.6' and engine_code = 'Mezger Turbo' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2007 and 2009 and trim = 'Turbo 3.6' and engine_code = 'Mezger Turbo' and drivetrain = 'AWD' and transmission = '5-speed Tiptronic S')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2007 and 2008 and trim = 'GT3 3.6' and engine_code = 'Mezger GT3' and drivetrain = 'RWD' and transmission = '6-speed GT manual')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2007 and 2008 and trim = 'GT3 RS 3.6' and engine_code = 'Mezger GT3 RS' and drivetrain = 'RWD' and transmission = '6-speed GT manual')
    or
    (brand = 'Porsche' and model = '911 (997.1)' and model_year between 2008 and 2009 and trim = 'GT2 3.6' and engine_code = 'Mezger GT2' and drivetrain = 'RWD' and transmission = '6-speed GT manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2009 and 2012 and trim = 'Carrera 3.6' and engine_code = 'MA1 DFI Carrera' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2009 and 2012 and trim = 'Carrera 3.6' and engine_code = 'MA1 DFI Carrera' and drivetrain = 'RWD' and transmission = '7-speed PDK')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2009 and 2012 and trim = 'Carrera S 3.8' and engine_code = 'MA1 DFI Carrera S' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2009 and 2012 and trim = 'Carrera S 3.8' and engine_code = 'MA1 DFI Carrera S' and drivetrain = 'RWD' and transmission = '7-speed PDK')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2009 and 2012 and trim = 'Carrera 4 3.6' and engine_code = 'MA1 DFI Carrera' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2009 and 2012 and trim = 'Carrera 4 3.6' and engine_code = 'MA1 DFI Carrera' and drivetrain = 'AWD' and transmission = '7-speed PDK')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2009 and 2012 and trim = 'Carrera 4S 3.8' and engine_code = 'MA1 DFI Carrera S' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2009 and 2012 and trim = 'Carrera 4S 3.8' and engine_code = 'MA1 DFI Carrera S' and drivetrain = 'AWD' and transmission = '7-speed PDK')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2009 and 2012 and trim = 'Targa 4 3.6' and engine_code = 'MA1 DFI Carrera' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2009 and 2012 and trim = 'Targa 4 3.6' and engine_code = 'MA1 DFI Carrera' and drivetrain = 'AWD' and transmission = '7-speed PDK')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2009 and 2012 and trim = 'Targa 4S 3.8' and engine_code = 'MA1 DFI Carrera S' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2009 and 2012 and trim = 'Targa 4S 3.8' and engine_code = 'MA1 DFI Carrera S' and drivetrain = 'AWD' and transmission = '7-speed PDK')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2011 and 2012 and trim = 'GTS 3.8' and engine_code = 'MA1 DFI GTS' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2011 and 2012 and trim = 'GTS 3.8' and engine_code = 'MA1 DFI GTS' and drivetrain = 'RWD' and transmission = '7-speed PDK')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2011 and 2012 and trim = 'C4 GTS 3.8' and engine_code = 'MA1 DFI GTS' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2011 and 2012 and trim = 'C4 GTS 3.8' and engine_code = 'MA1 DFI GTS' and drivetrain = 'AWD' and transmission = '7-speed PDK')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2011 and 2011 and trim = 'Speedster 3.8' and engine_code = 'MA1 DFI GTS' and drivetrain = 'RWD' and transmission = '7-speed PDK')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2010 and 2012 and trim = 'Turbo 3.8' and engine_code = '997.2 Turbo DFI' and drivetrain = 'AWD' and transmission = '6-speed manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2010 and 2012 and trim = 'Turbo 3.8' and engine_code = '997.2 Turbo DFI' and drivetrain = 'AWD' and transmission = '7-speed PDK')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2010 and 2012 and trim = 'Turbo S 3.8' and engine_code = '997.2 Turbo DFI' and drivetrain = 'AWD' and transmission = '7-speed PDK')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2010 and 2011 and trim = 'GT3 3.8' and engine_code = 'Mezger GT3' and drivetrain = 'RWD' and transmission = '6-speed GT manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2010 and 2011 and trim = 'GT3 RS 3.8' and engine_code = 'Mezger GT3 RS' and drivetrain = 'RWD' and transmission = '6-speed GT manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2011 and 2011 and trim = 'GT3 RS 4.0' and engine_code = 'Mezger GT3 RS 4.0' and drivetrain = 'RWD' and transmission = '6-speed GT manual')
    or
    (brand = 'Porsche' and model = '911 (997.2)' and model_year between 2011 and 2011 and trim = 'GT2 RS 3.6' and engine_code = 'Mezger GT2 RS' and drivetrain = 'RWD' and transmission = '6-speed GT manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NA)' and model_year between 1990 and 1993 and trim = 'MX-5 Miata · 1.6L' and engine_code = 'B6' and drivetrain = 'RWD' and transmission = '5-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NA)' and model_year between 1990 and 1993 and trim = 'MX-5 Miata · 1.6L' and engine_code = 'B6' and drivetrain = 'RWD' and transmission = '4-speed automatic')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NA)' and model_year between 1994 and 1996 and trim = 'MX-5 Miata · 1.8L' and engine_code = '1.8L BP DOHC' and drivetrain = 'RWD' and transmission = '5-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NA)' and model_year between 1994 and 1996 and trim = 'MX-5 Miata · 1.8L' and engine_code = '1.8L BP DOHC' and drivetrain = 'RWD' and transmission = '4-speed automatic')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NA)' and model_year between 1997 and 1997 and trim = 'MX-5 Miata · 1.8L' and engine_code = '1.8L BP DOHC' and drivetrain = 'RWD' and transmission = '5-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NA)' and model_year between 1997 and 1997 and trim = 'MX-5 Miata · 1.8L' and engine_code = '1.8L BP DOHC' and drivetrain = 'RWD' and transmission = '4-speed automatic')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NB)' and model_year between 1999 and 2000 and trim = 'MX-5 Miata · NB1' and engine_code = 'BP-4W' and drivetrain = 'RWD' and transmission = '5-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NB)' and model_year between 1999 and 2000 and trim = 'MX-5 Miata · NB1' and engine_code = 'BP-4W' and drivetrain = 'RWD' and transmission = '4-speed automatic')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NB)' and model_year between 2001 and 2003 and trim = 'MX-5 Miata · NB2' and engine_code = 'BP-Z3' and drivetrain = 'RWD' and transmission = '5-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NB)' and model_year between 2001 and 2003 and trim = 'MX-5 Miata · NB2' and engine_code = 'BP-Z3' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NB)' and model_year between 2001 and 2003 and trim = 'MX-5 Miata · NB2' and engine_code = 'BP-Z3' and drivetrain = 'RWD' and transmission = '4-speed automatic')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NB)' and model_year between 2004 and 2005 and trim = 'MX-5 Miata · NB2' and engine_code = 'BP-Z3' and drivetrain = 'RWD' and transmission = '5-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NB)' and model_year between 2004 and 2005 and trim = 'MX-5 Miata · NB2' and engine_code = 'BP-Z3' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NB)' and model_year between 2004 and 2005 and trim = 'MX-5 Miata · NB2' and engine_code = 'BP-Z3' and drivetrain = 'RWD' and transmission = '4-speed automatic')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NB)' and model_year between 2004 and 2005 and trim = 'Mazdaspeed MX-5' and engine_code = 'BP Turbo' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NC)' and model_year between 2006 and 2008 and trim = 'MX-5 Miata · NC1' and engine_code = 'LF-VE' and drivetrain = 'RWD' and transmission = '5-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NC)' and model_year between 2006 and 2008 and trim = 'MX-5 Miata · NC1' and engine_code = 'LF-VE' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NC)' and model_year between 2006 and 2008 and trim = 'MX-5 Miata · NC1' and engine_code = 'LF-VE' and drivetrain = 'RWD' and transmission = '6-speed automatic')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NC)' and model_year between 2009 and 2012 and trim = 'MX-5 Miata · NC2' and engine_code = 'LF-VE' and drivetrain = 'RWD' and transmission = '5-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NC)' and model_year between 2009 and 2012 and trim = 'MX-5 Miata · NC2' and engine_code = 'LF-VE' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NC)' and model_year between 2009 and 2012 and trim = 'MX-5 Miata · NC2' and engine_code = 'LF-VE' and drivetrain = 'RWD' and transmission = '6-speed automatic')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NC)' and model_year between 2013 and 2015 and trim = 'MX-5 Miata · NC3' and engine_code = 'LF-VE' and drivetrain = 'RWD' and transmission = '5-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NC)' and model_year between 2013 and 2015 and trim = 'MX-5 Miata · NC3' and engine_code = 'LF-VE' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (NC)' and model_year between 2013 and 2015 and trim = 'MX-5 Miata · NC3' and engine_code = 'LF-VE' and drivetrain = 'RWD' and transmission = '6-speed automatic')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (ND)' and model_year between 2016 and 2018 and trim = 'MX-5 Miata · ND1' and engine_code = 'SKYACTIV-G 2.0L' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (ND)' and model_year between 2016 and 2018 and trim = 'MX-5 Miata · ND1' and engine_code = 'SKYACTIV-G 2.0L' and drivetrain = 'RWD' and transmission = '6-speed automatic')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (ND)' and model_year between 2019 and 2023 and trim = 'MX-5 Miata · ND2' and engine_code = 'SKYACTIV-G 2.0L' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (ND)' and model_year between 2019 and 2023 and trim = 'MX-5 Miata · ND2' and engine_code = 'SKYACTIV-G 2.0L' and drivetrain = 'RWD' and transmission = '6-speed automatic')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (ND)' and model_year between 2024 and 2025 and trim = 'MX-5 Miata · ND3' and engine_code = 'SKYACTIV-G 2.0L' and drivetrain = 'RWD' and transmission = '6-speed manual')
    or
    (brand = 'Mazda' and model = 'MX-5 Miata (ND)' and model_year between 2024 and 2025 and trim = 'MX-5 Miata · ND3' and engine_code = 'SKYACTIV-G 2.0L' and drivetrain = 'RWD' and transmission = '6-speed automatic')
    or
    (brand = 'BMW' and model = '5 Series (F10)' and model_year between 2011 and 2011 and trim = '528i' and engine_code = 'N52' and drivetrain = 'RWD' and transmission = '8-speed automatic')
    or
    (brand = 'BMW' and model = '5 Series (F10)' and model_year between 2012 and 2016 and trim = '528i' and engine_code = 'N20' and drivetrain = 'RWD' and transmission = '8-speed automatic')
    or
    (brand = 'BMW' and model = '5 Series (F10)' and model_year between 2012 and 2016 and trim = '528i xDrive' and engine_code = 'N20' and drivetrain = 'xDrive' and transmission = '8-speed automatic')
    or
    (brand = 'BMW' and model = '5 Series (F10)' and model_year between 2011 and 2016 and trim = '535i' and engine_code = 'N55' and drivetrain = 'RWD' and transmission = '8-speed automatic')
    or
    (brand = 'BMW' and model = '5 Series (F10)' and model_year between 2011 and 2016 and trim = '535i xDrive' and engine_code = 'N55' and drivetrain = 'xDrive' and transmission = '8-speed automatic')
    or
    (brand = 'BMW' and model = '5 Series (F10)' and model_year between 2011 and 2013 and trim = '550i' and engine_code = 'N63' and drivetrain = 'RWD' and transmission = '8-speed automatic')
    or
    (brand = 'BMW' and model = '5 Series (F10)' and model_year between 2011 and 2013 and trim = '550i xDrive' and engine_code = 'N63' and drivetrain = 'xDrive' and transmission = '8-speed automatic')
    or
    (brand = 'BMW' and model = '5 Series (F10)' and model_year between 2014 and 2016 and trim = '550i' and engine_code = 'N63TU' and drivetrain = 'RWD' and transmission = '8-speed automatic')
    or
    (brand = 'BMW' and model = '5 Series (F10)' and model_year between 2014 and 2016 and trim = '550i xDrive' and engine_code = 'N63TU' and drivetrain = 'xDrive' and transmission = '8-speed automatic')
    or
    (brand = 'BMW' and model = '5 Series (F10)' and model_year between 2014 and 2016 and trim = '535d' and engine_code = 'N57TU' and drivetrain = 'RWD' and transmission = '8-speed automatic')
    or
    (brand = 'BMW' and model = '5 Series (F10)' and model_year between 2014 and 2016 and trim = '535d xDrive' and engine_code = 'N57TU' and drivetrain = 'xDrive' and transmission = '8-speed automatic')
    or
    (brand = 'BMW' and model = '5 Series (F10)' and model_year between 2012 and 2016 and trim = 'ActiveHybrid 5' and engine_code = 'N55' and drivetrain = 'RWD' and transmission = '8-speed hybrid automatic')
    or
    (brand = 'BMW' and model = 'M5 (F10)' and model_year between 2013 and 2016 and trim = 'M5' and engine_code = 'S63TU' and drivetrain = 'RWD' and transmission = '7-speed M-DCT')
    or
    (brand = 'BMW' and model = 'M5 (F10)' and model_year between 2013 and 2016 and trim = 'M5' and engine_code = 'S63TU' and drivetrain = 'RWD' and transmission = '6-speed manual GS6-53BZ')
  );
