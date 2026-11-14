import type {Metadata} from 'next';
import {FirstSessionObservation} from '@/components/research/first-session-observation';

export const metadata:Metadata={
  title:'R11.3 匿名首次试玩观察 · 怪物公寓',
  description:'主持人本地生成匿名首次试玩 CSV 的辅助页面；不上传或保存玩家数据。',
  robots:{index:false,follow:false},
};
export default function FirstSessionResearchPage(){
  return <FirstSessionObservation/>;
}
