import type { SpiritId } from './spirit-collection';

export type SpiritArt = {
  /** Silhouette, optional appendages, and recognizable markings in a 120x120 portrait. */
  body: string;
  back: string;
  mark: string;
  primary: string;
  highlight: string;
  shadow: string;
  eyesY: number;
};

/** Original vector art direction: each spirit has a distinct silhouette rather than a recolored template. */
export const SPIRIT_ART: Record<SpiritId, SpiritArt> = {
  'aurora-whale': {
    body: 'M17 67 Q13 46 36 40 Q62 21 88 43 Q108 53 104 71 Q99 88 68 91 Q38 96 20 82 Z',
    back: 'M20 63 Q5 51 5 32 Q23 32 36 45 M81 48 Q103 21 114 29 Q113 52 98 64 M54 34 L61 15 L69 34',
    mark: 'M46 74 Q62 85 81 68 M60 41 L64 52 L75 52 L66 60 L70 72 L59 64 L48 72 L52 59 L43 52 L55 52 Z',
    primary: '#5ABBD1', highlight: '#CDF9F3', shadow: '#27647A', eyesY: 65,
  },
  'mirror-koi': {
    body: 'M29 67 Q33 34 67 36 Q95 39 91 70 Q87 92 61 95 Q34 93 29 67 Z',
    back: 'M38 62 Q14 44 8 30 Q28 29 45 43 M87 61 Q111 41 118 52 Q112 70 91 77 M59 38 Q64 15 77 25',
    mark: 'M54 50 Q64 45 73 53 M49 79 Q66 72 78 80 M59 22 L65 33 L71 22',
    primary: '#70C7E8', highlight: '#E1FAFF', shadow: '#315C8B', eyesY: 66,
  },
  'cinder-stag': {
    body: 'M31 85 Q23 65 37 44 Q49 33 74 39 Q94 50 86 77 Q81 93 59 94 Z',
    back: 'M46 42 Q29 23 25 7 M46 42 Q15 24 7 27 M74 42 Q85 24 85 7 M74 42 Q102 23 114 26 M38 46 L26 28 L50 36 M78 39 L100 26 L92 49',
    mark: 'M57 46 L68 56 L59 70 L52 59 Z M46 79 Q62 86 77 79',
    primary: '#EE8B57', highlight: '#FFE5A3', shadow: '#84415A', eyesY: 67,
  },
  'prism-mole': {
    body: 'M17 75 Q21 44 48 46 Q59 26 76 39 Q102 43 104 71 Q108 94 60 97 Q23 95 17 75 Z',
    back: 'M31 53 L38 20 L52 39 L65 13 L77 39 L91 21 L95 54 M25 80 L7 87 L25 91 M93 82 L113 89 L96 92',
    mark: 'M52 43 L63 53 L55 66 L45 55 Z M71 47 L83 58 L73 72 L64 60 Z',
    primary: '#C9A574', highlight: '#F4E3AE', shadow: '#765B71', eyesY: 76,
  },
  'eclipse-moth': {
    body: 'M49 45 Q55 31 67 37 Q80 44 77 75 Q74 94 62 96 Q45 91 45 70 Z',
    back: 'M52 51 Q17 12 6 39 Q2 66 40 76 M74 51 Q104 11 116 38 Q120 69 83 78 M43 77 Q18 75 18 103 Q42 106 52 84 M80 77 Q104 74 103 103 Q80 107 73 84',
    mark: 'M20 45 Q37 31 46 64 M101 45 Q85 33 78 65 M60 42 L65 52 L73 53 L68 59 L70 68 L60 63 L51 68 L53 58 L49 52 L58 52 Z',
    primary: '#AF8AE0', highlight: '#EBD5FE', shadow: '#4C376F', eyesY: 62,
  },
  'whisper-cat': {
    body: 'M24 70 Q23 47 36 33 L43 19 L54 32 Q68 28 79 34 L91 19 L97 53 Q104 86 77 96 Q34 105 24 70 Z',
    back: 'M33 85 Q3 77 8 61 Q16 51 23 64 M83 88 Q111 84 115 65',
    mark: 'M51 81 Q61 88 72 81 M62 72 L57 77 L66 77 Z M32 58 L13 52 M91 58 L110 52',
    primary: '#9D99E5', highlight: '#ECE7FF', shadow: '#514A83', eyesY: 64,
  },
  'root-crown': {
    body: 'M26 84 Q14 59 34 39 Q54 23 79 41 Q103 61 93 88 Q67 102 35 93 Z',
    back: 'M42 39 Q18 26 27 9 Q40 10 51 34 M73 40 Q91 16 108 23 Q107 44 81 49 M58 37 Q49 15 57 3 Q71 17 68 35',
    mark: 'M33 80 Q58 91 84 80 M57 50 L61 33 L66 51 M47 90 L42 111 M77 91 L82 112',
    primary: '#71AE83', highlight: '#DCF6AD', shadow: '#376951', eyesY: 67,
  },
  'dew-phoenix': {
    body: 'M40 83 Q38 56 49 39 Q67 29 79 46 Q86 62 78 85 Q59 101 40 83 Z',
    back: 'M49 54 Q11 17 7 35 Q6 70 43 81 M75 56 Q109 18 116 35 Q112 70 80 81 M53 41 L67 10 L72 40 M47 86 Q20 97 32 114 M75 87 Q98 98 84 115',
    mark: 'M57 51 Q63 60 73 52 M58 81 Q69 86 76 79',
    primary: '#DF9A64', highlight: '#FFEDC5', shadow: '#8E5454', eyesY: 69,
  },
  'wave-healer': {
    body: 'M28 70 Q25 43 60 38 Q99 39 94 75 Q92 94 62 97 Q36 97 28 70 Z',
    back: 'M39 51 Q15 29 14 46 Q13 71 32 78 M84 50 Q106 30 110 47 Q113 73 93 77 M49 40 Q44 18 57 19 Q62 31 67 39',
    mark: 'M60 47 L60 70 M48 58 L72 58 M39 82 Q61 94 83 82',
    primary: '#5CCBD0', highlight: '#D1FFF6', shadow: '#3B778A', eyesY: 75,
  },
  'day-smith': {
    body: 'M26 83 Q18 57 41 44 Q56 25 79 43 Q105 59 94 87 Q63 99 35 94 Z',
    back: 'M36 44 L26 18 L45 35 L54 13 L62 38 L78 16 L88 44 M30 88 L9 92 L17 104 L37 100 M86 88 L109 92 L101 104 L83 100',
    mark: 'M59 50 L72 64 L61 82 L48 65 Z M56 65 L65 65',
    primary: '#D99255', highlight: '#FBE2A0', shadow: '#70536C', eyesY: 75,
  },
  'dusk-bell': {
    body: 'M35 78 Q36 40 61 29 Q89 44 88 80 Q87 97 60 101 Q36 98 35 78 Z',
    back: 'M33 65 Q10 59 9 82 L35 91 M90 64 Q111 59 113 82 L89 92 M52 36 L62 16 L72 36',
    mark: 'M42 89 Q62 103 81 90 M51 76 Q63 84 75 76 M57 18 L62 8 L67 18',
    primary: '#9982D0', highlight: '#E6D6FB', shadow: '#44376F', eyesY: 67,
  },
  'moss-keeper': {
    body: 'M24 77 Q23 42 58 41 Q96 37 99 75 Q98 99 61 99 Q29 98 24 77 Z',
    back: 'M40 49 Q10 38 22 16 Q45 19 52 43 M75 47 Q91 16 109 19 Q111 42 83 54 M55 38 Q55 15 68 13 L71 41',
    mark: 'M35 85 Q59 99 86 85 M54 46 L65 57 L55 69 L45 57 Z M75 47 L84 57 L75 67 L66 57 Z',
    primary: '#87BB79', highlight: '#E7F6BE', shadow: '#4C7355', eyesY: 78,
  },
  'dewdrop': {
    body: 'M61 16 Q73 37 86 54 Q101 77 82 93 Q58 108 36 90 Q22 75 39 51 Q54 30 61 16 Z',
    back: 'M43 83 Q16 75 9 89 Q16 102 41 94 M80 83 Q105 74 115 91 Q107 102 84 94',
    mark: 'M47 60 Q62 50 74 61 M49 86 Q64 94 79 83',
    primary: '#79CBE4', highlight: '#E0FCFF', shadow: '#427E9D', eyesY: 73,
  },
  'lantern-beetle': {
    body: 'M30 81 Q22 54 44 41 Q65 29 86 44 Q105 57 94 82 Q79 101 55 98 Q37 97 30 81 Z',
    back: 'M48 42 Q38 20 25 17 M76 42 Q84 21 98 18 M32 75 Q12 69 10 86 L32 91 M89 75 Q110 68 115 86 L90 92',
    mark: 'M61 43 L61 91 M43 66 Q61 73 80 65 M42 83 Q61 90 80 83',
    primary: '#EAA85D', highlight: '#FFE9BC', shadow: '#84536B', eyesY: 56,
  },
  'moon-scout': {
    body: 'M42 83 Q39 58 55 43 Q71 39 82 54 Q94 74 77 94 Q55 103 42 83 Z',
    back: 'M47 56 Q14 24 8 48 Q11 78 42 79 M76 58 Q104 25 115 48 Q109 80 84 80 M58 44 L66 21 L71 43',
    mark: 'M59 66 Q69 72 78 64 M53 85 Q66 96 78 83',
    primary: '#B69FDB', highlight: '#F4E5FB', shadow: '#594779', eyesY: 72,
  },
  'fern-hare': {
    body: 'M28 81 Q20 51 46 41 Q66 35 86 48 Q104 70 90 92 Q59 107 34 94 Z',
    back: 'M42 46 Q27 22 38 2 Q51 10 55 43 M65 42 Q72 5 91 5 Q96 26 80 48',
    mark: 'M46 89 Q61 100 77 87 M58 76 L65 80 L70 76 M26 76 L10 70 M92 75 L109 69',
    primary: '#9FCB82', highlight: '#F1F9CC', shadow: '#4F7754', eyesY: 67,
  },
  'pebble-crab': {
    body: 'M29 67 Q34 44 61 44 Q89 44 94 70 Q92 91 62 93 Q37 90 29 67 Z',
    back: 'M30 60 L13 49 L7 36 L26 40 L38 55 M94 60 L108 46 L116 36 L97 38 L82 55 M39 84 L24 102 M84 84 L101 102',
    mark: 'M49 82 Q63 88 78 82 M52 51 L56 44 L61 51',
    primary: '#8DC6AB', highlight: '#E6F6D0', shadow: '#4A7E80', eyesY: 65,
  },
  seedling: {
    body: 'M36 77 Q28 51 47 41 Q65 34 83 48 Q99 68 87 91 Q65 104 43 94 Z',
    back: 'M60 44 Q42 28 37 14 Q57 15 65 39 M65 43 Q72 17 94 19 Q85 38 68 48 M56 44 L57 25',
    mark: 'M50 78 Q64 87 76 78 M58 57 L64 50 L70 57',
    primary: '#84C68D', highlight: '#E7F6BD', shadow: '#4A8160', eyesY: 68,
  },
};
