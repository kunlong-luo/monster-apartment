import {describe,expect,it} from 'vitest';
import {approvedMachineUrls,workerPaintingUrls} from '../src/lib/moonwork/workshop-machine-art-index';

describe('approved PC machine painting resolution',()=>{
  const root='https://kunlong-luo.github.io/monster-apartment/workshop/';
  it('loads only exact formal level paths, not review art or other machines',()=>{
    const data={schemaVersion:1,machines:{
      well:{'1':'production/machines/well/lv1.webp',
        '2':'review/machines/well/lv2.webp',
        '3':'production/machines/kiln/lv3.webp'},
      garden:{'2':'production/machines/garden/lv2.webp',
        '3':'https://evil.test/trick.webp'},
      kiln:{'2':'production/machines/kiln/../../review/kiln.webp'}
    },review:{well:{'2':'review/machines/well/lv2.webp'}}};
    expect(approvedMachineUrls(data,root)).toEqual({
      well:{'1':root+'assets/production/machines/well/lv1.webp'},
      garden:{'2':root+'assets/production/machines/garden/lv2.webp'}
    });
  });
  it('rejects stale indexes and unsafe asset origins',()=>{
    expect(approvedMachineUrls({schemaVersion:3,machines:{}},root)).toEqual({});
    expect(approvedMachineUrls({schemaVersion:1,machines:{well:'bad'}},root)).toEqual({});
    expect(approvedMachineUrls({schemaVersion:1,machines:{well:{'1':
      'production/machines/well/lv1.webp'}}},'javascript:alert(1)')).toEqual({});
    expect(approvedMachineUrls(null,root)).toEqual({});
  });
  it('resolves the independent Pixi asset-server root in dev',()=>{
    const dev='http://127.0.0.1:3901/';
    expect(approvedMachineUrls({schemaVersion:1,machines:{
      kiln:{'3':'production/machines/kiln/lv3.webp'}
    }},dev)).toEqual({
      kiln:{'3':'http://127.0.0.1:3901/assets/production/machines/kiln/lv3.webp'}
    });
  });
});

describe('worker CG is gated independently by art approval tier',()=>{
  const root='https://kunlong-luo.github.io/monster-apartment/workshop/';
  it('serves only approved full-body worker URLs to normal players',()=>{
    const index={schemaVersion:1,
      workers:{brook:'workers/brook.webp',
        fern:'review/workers/fern.webp',
        cinder:'https://example.org/cinder.webp'},
      reviewWorkers:{fern:'review/workers/fern.webp',brook:'workers/brook.webp'}
    };
    expect(workerPaintingUrls(index,root)).toEqual({
      brook:root+'assets/workers/brook.webp'
    });
    expect(workerPaintingUrls(index,root,'review')).toEqual({
      fern:root+'assets/review/workers/fern.webp'
    });
  });
  it('rejects invalid indexes and unsafe hosts',()=>{
    const index={schemaVersion:1,workers:{brook:'workers/brook.webp'}};
    expect(workerPaintingUrls({...index,schemaVersion:2},root)).toEqual({});
    expect(workerPaintingUrls(index,'data:text/html,evil')).toEqual({});
    expect(workerPaintingUrls({schemaVersion:1,workers:[]},root)).toEqual({});
    expect(workerPaintingUrls(index,'http://127.0.0.1:3901/')).toEqual({
      brook:'http://127.0.0.1:3901/assets/workers/brook.webp'
    });
  });
});
