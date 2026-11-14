/** R11.3 anonymized first-session observation schema; mirrors the research CSV template. */
export const FIRST_SESSION_FIELDS=[
  'participant_id','device','viewport','browser','session_minutes',
  'entered_workshop','assigned_worker_without_help',
  'enabled_auto_production_without_help','enabled_auto_delivery_without_help',
  'completed_first_order','order_time_available_minutes','major_blocker',
  'needed_hint','hint_timestamp_minutes','would_replay','replay_reason','notes',
] as const;
export type FirstSessionField=(typeof FIRST_SESSION_FIELDS)[number];
export type FirstSessionRecord=Record<FirstSessionField,string>;
export function emptyFirstSessionRecord():FirstSessionRecord{
  return Object.fromEntries(FIRST_SESSION_FIELDS.map(key=>[key,''])) as FirstSessionRecord;
}
/** Prefix spreadsheet formula-looking text; CSV quotes alone do not prevent injection. */
export function escapeFirstSessionCell(value:string):string{
  const safe=/^[\s\uFEFF]*[=+\-@]/u.test(value)?"'"+value:value;
  return '"'+safe.replace(/"/g,'""')+'"';
}
export function firstSessionCsv(record:FirstSessionRecord):string{
  return FIRST_SESSION_FIELDS.join(',')+'\r\n'+
    FIRST_SESSION_FIELDS.map(key=>escapeFirstSessionCell(record[key])).join(',')+'\r\n';
}
