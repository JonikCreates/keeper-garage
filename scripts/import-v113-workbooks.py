"""Read the ten supplied workbooks into Keeper's existing Enhanced catalog schema.

Usage: python scripts/import-v113-workbooks.py <source directory>
Requires openpyxl for read-only XLSX extraction. Never modifies source workbooks.
"""
import hashlib
import json
import pathlib
import re
import sys
import openpyxl

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = pathlib.Path(sys.argv[1])
FILES = [f'Chevrolet Corvette C{n} USDM' + (' 2020-2026' if n == 8 else '') + ' - Keeper Enhanced E46 Standard.xlsx' for n in range(5, 9)] + [f'Toyota {model} JZX{gen} JDM - Keeper Enhanced E46 Standard.xlsx' for model in ['Chaser', 'Cresta', 'Mark II'] for gen in [90, 100]]
data = {key: [] for key in ['PLATFORMS', 'VARIANTS', 'SCHEDULE_PROFILES', 'ISSUES', 'INSIGHTS']}
data.update(SCHEDULE_ROWS={}, SCHEDULES={})
audit = []

def slug(value):
    return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')

def years(value):
    found = [int(x) for x in re.findall(r'\b(?:19|20)\d{2}\b', str(value))]
    assert found, value
    return min(found), max(found)

def text(value):
    return '' if value is None else str(value)

def url(value):
    return value if isinstance(value, str) and value.startswith(('https://', 'http://')) else None

def category(name):
    for pattern, label in [(r'brake', 'Brakes'), (r'transmission|clutch|differential|driveline|torque tube|axle', 'Drivetrain'), (r'coolant|radiator|thermostat|water pump|fan|cooling', 'Cooling'), (r'suspension|steering|chassis|wheel|tire|ball joint', 'Chassis'), (r'roof|weatherstrip|door|hatch|body|seat', 'Body'), (r'electri|battery|ECU|lighting|headlamp|sensor', 'Electrical')]:
        if re.search(pattern, name, re.I): return label
    return 'Engine'

def severity(name):
    if re.search(r'brake|ball joint|fuel.*hos|timing belt|engine oil|high.voltage', name, re.I): return 'critical'
    if re.search(r'fluid|coolant|spark|belt|leak', name, re.I): return 'important'
    return 'routine'

for filename in FILES:
    path = SOURCE / filename
    book = openpyxl.load_workbook(path, data_only=True, read_only=True)
    sheets = {s.title: list(s.values) for s in book.worksheets}
    corvette = filename.startswith('Chevrolet')
    chassis = re.search(r'C[5-8]|JZX\d+', filename)[0]
    model = 'Corvette' if corvette else filename.split(' JZX')[0].removeprefix('Toyota ')
    platform = f'CORVETTE_{chassis}' if corvette else f'{slug(model).upper().replace("-", "_")}_{chassis}'
    brand = 'Chevrolet' if corvette else 'Toyota'
    index = sheets['Keeper Trim Index']
    tabs = [r[7] for r in index[4:] if r[7]]
    all_years = [years(r[2] if corvette else r[1]) for r in index[4:] if r[7]]
    data['PLATFORMS'].append(dict(value=platform, brand=brand, label=f'{model} ({chassis})', yearStart=min(y[0] for y in all_years), yearEnd=max(y[1] for y in all_years)))
    profile_map = {}
    sheet_audit = {}
    for tab in tabs:
        rows = sheets[tab]
        profiles = []
        for row in rows[5:]:
            if not row or not row[0]: break
            name = row[0]
            start, end = years(row[1])
            engine = row[3] if corvette else row[2]
            code = re.match(r'[A-Z0-9]+(?:-[A-Z]+)?', engine)[0]
            raw_trans = row[4] if corvette else row[3]
            match = re.search(r'(\d)(MT|AT|DCT)', raw_trans)
            assert match, raw_trans
            speed, kind = match.groups()
            trans = f'{speed}-speed ' + {'MT': 'manual', 'AT': 'automatic', 'DCT': 'DCT'}[kind] + f' ({raw_trans})'
            if not corvette and re.search(r'96-98|98-01', name):
                trans += f' / {row[1]} build period'
            trim = re.sub(r'^C[5-8] ', '', tab) if corvette else tab
            # Z51 changes the oiling hardware but is absent from the saved profile
            # schema. Give its real package a trim choice to avoid wet/dry mixing.
            if corvette and chassis == 'C7' and 'Z51' in name: trim += ' (Z51)'
            sid = 'v113-' + slug(platform + '-' + tab + '-' + name)
            profile = dict(brand=brand, platform=platform, scheduleId=sid, tab=tab, trim=trim, label=trim, yearStart=start, yearEnd=end, engineCodes=[code], engineLabel=engine, drivetrain='AWD' if corvette and ('E-Ray' in tab or 'ZR1X' in tab) else 'RWD', transmission=trans, body=row[2] if corvette else ('Sedan' if model == 'Cresta' else '4-door hardtop'), applicability=' | '.join(text(v) for v in [rows[1][0], rows[2][0], *row[5:10]] if v), sourceWorkbook=filename)
            data['SCHEDULE_PROFILES'].append(profile)
            data['VARIANTS'].append({**profile, 'engineCode': code})
            data['SCHEDULES'][sid] = []
            profile_map[(tab, name)] = profile
            profiles.append(profile)
        numeric_rows = 0
        for rownum, row in enumerate(rows, 1):
            if not row or not isinstance(row[0], (int, float)) or not row[1]: continue
            numeric_rows += 1
            applicable = row[16]
            targets = [profile_map[(tab, applicable)]] if (tab, applicable) in profile_map else profiles
            assert targets and (applicable in (tab, re.sub(r'^C[5-8] ', '', tab), profiles[0]['body']) or (tab, applicable) in profile_map), (tab, applicable)
            rid = 'v113-' + slug(platform + '-' + tab) + f'-r{rownum}'
            data['SCHEDULE_ROWS'][rid] = dict(name=row[1], category=category(row[1]), severity=severity(row[1]), entryType=text(row[2]), action=text(row[3]), mileage=row[4], months=row[6], trigger=text(row[7]), basis=text(row[8]), amount=text(row[9]), specification=text(row[10]), primaryUrl=url(row[11]), secondaryUrl=url(row[12]), verification=text(row[13]), notes=' | '.join(text(v) for v in [row[14], row[15], 'Applies to: ' + text(applicable)] if v))
            for profile in targets: data['SCHEDULES'][profile['scheduleId']].append(rid)
        sheet_audit[tab] = dict(profiles=len(profiles), maintenanceRows=numeric_rows)
    issues = sheets['Known Issues by Trim']
    for rownum, row in enumerate(issues[4:], 5):
        if not row or not row[0]: continue
        issue_profile = row[6] if corvette else row[2]
        targets = [profile_map[(row[0], issue_profile)]] if (row[0], issue_profile) in profile_map else [p for (t,n),p in profile_map.items() if t == row[0]]
        assert targets
        profile = targets[0]
        offset = 2 if corvette else 0
        name, evidence, level, symptoms, action, miles, months, source, verification, note = row[5+offset:15+offset]
        sev = {'Critical': 'critical', 'High': 'important'}.get(level, 'routine')
        data['ISSUES'].append(dict(slug=f'v113-{slug(platform)}-issue-{rownum}', platform=platform, scheduleIds=[profile['scheduleId']], years=list(range(profile['yearStart'], profile['yearEnd']+1)), system=category(name), issue=name, description=' | '.join(text(v) for v in [evidence, symptoms, note] if v), symptoms=text(symptoms), typicalMileage=f'{miles:,} miles' if miles else 'Condition based', severity=sev, urgency='urgent' if sev == 'critical' else 'watch', evidence='OEM' if source and ('toyota.jp' in source or 'nhtsa.gov' in source or 'chevrolet.com' in source) else 'Community consensus', evidenceLabel=text(evidence), preventativeAction=text(action), inspectionReminder=' | '.join(text(v) for v in [f'{miles} mi' if miles else None, f'{months} months' if months else None, symptoms] if v), verification=text(verification), clarification=text(note), configuration=profile['applicability'], source=dict(type='OEM' if source and ('toyota.jp' in source or 'nhtsa.gov' in source or 'chevrolet.com' in source) else 'Community consensus', title=name, publisher='Workbook reference', url=source, note=text(verification)) if url(source) else None, sourceWorkbook=filename))
        data['ISSUES'][-1]['scheduleIds'] = [p['scheduleId'] for p in targets]
        data['ISSUES'][-1]['years'] = sorted({y for p in targets for y in range(p['yearStart'], p['yearEnd']+1)})
    supporting = {}
    for tab, rows in sheets.items():
        if tab in tabs or tab in ['Index', 'Keeper Trim Index', 'Known Issues by Trim', 'User Maintenance Log']: continue
        header_at = 2 if tab == 'Legend' else 3
        headers = rows[header_at]
        count = 0
        for rownum, row in enumerate(rows[header_at+1:], header_at+2):
            if not row or not row[0]: continue
            count += 1
            data['INSIGHTS'].append(dict(slug=f'v113-{slug(platform)}-{slug(tab)}-{rownum}', platform=platform, category=tab, title=text(row[0]), summary=' | '.join(f'{text(h)}: {text(v)}' for h,v in zip(headers,row) if h and v is not None), sourceUrl=next((url(v) for v in row if url(v)),None), sourceWorkbook=filename))
        supporting[tab] = count
    assert not any(any(v is not None for v in r) for r in sheets['User Maintenance Log'][4:]), 'Unexpected user records in source'
    audit.append(dict(workbook=filename, sha256=hashlib.sha256(path.read_bytes()).hexdigest(), platform=platform, trims=sheet_audit, knownIssues=sum(bool(r[0]) for r in issues[4:]), supportingRows=supporting))

types = dict(PLATFORMS='EnhancedPlatformRecord[]', VARIANTS='EnhancedVariantRecord[]', SCHEDULE_PROFILES='EnhancedScheduleProfileRecord[]', SCHEDULE_ROWS='Record<string, EnhancedScheduleRow>', SCHEDULES='Record<string, string[]>', ISSUES='EnhancedIssueRecord[]', INSIGHTS='EnhancedInsightRecord[]')
out = '// Generated by scripts/import-v113-workbooks.py from the ten supplied workbooks.\n'
out += 'import type { EnhancedPlatformRecord, EnhancedVariantRecord, EnhancedScheduleProfileRecord, EnhancedScheduleRow, EnhancedIssueRecord, EnhancedInsightRecord } from "./enhancedVehicleData";\n\n'
for key, value in data.items(): out += f'export const V113_{key}: {types[key]} = '+json.dumps(value, ensure_ascii=False, indent=2)+';\n\n'
(ROOT/'lib/v113VehicleData.ts').write_text(out.rstrip()+'\n', encoding='utf-8')
(ROOT/'docs/v1.1.3-source-audit.json').write_text(json.dumps(audit,indent=2)+'\n',encoding='utf-8')
print(json.dumps({key:len(value) for key,value in data.items()}))
