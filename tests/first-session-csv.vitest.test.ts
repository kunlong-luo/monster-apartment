import {describe,expect,it} from 'vitest';
import {emptyFirstSessionRecord,escapeFirstSessionCell,
  FIRST_SESSION_FIELDS,firstSessionCsv} from '../src/lib/research/first-session-csv';

describe('R11.3 anonymous first-session CSV export',()=>{
  it('matches the researcher protocol and keeps unobserved items blank',()=>{
    expect(FIRST_SESSION_FIELDS).toEqual([
      'participant_id','device','viewport','browser','session_minutes',
      'entered_workshop','assigned_worker_without_help',
      'enabled_auto_production_without_help','enabled_auto_delivery_without_help',
      'completed_first_order','order_time_available_minutes','major_blocker',
      'needed_hint','hint_timestamp_minutes','would_replay','replay_reason','notes',
    ]);
    const record=emptyFirstSessionRecord();
    record.participant_id='T01';
    record.device='mobile';
    record.enabled_auto_production_without_help='true';
    const csv=firstSessionCsv(record);
    expect(csv.split('\r\n')).toHaveLength(3);
    expect(csv).toContain('"T01","mobile"');
    expect(csv).toContain('"true"');
    expect(csv).toContain(',"",""');
  });
  it('round-trips commas, newlines and quotes without losing Chinese notes',()=>{
    expect(escapeFirstSessionCell('看不到"自动履约",\n需要提示')).toBe(
      '"看不到""自动履约"",\n需要提示"');
  });
  it('prevents spreadsheet formula injection in unrestricted feedback fields',()=>{
    for(const input of ['=HYPERLINK("bad")',' +SUM(1,2)','-1+2','@SUM(A1)','\t=1+1']){
      const output=escapeFirstSessionCell(input);
      expect(output.startsWith('"\'')).toBe(true);
    }
    expect(escapeFirstSessionCell('月纱：美术好看')).toBe('"月纱：美术好看"');
  });
});
