import {
  accompanyingReadinesses,
  communityEngagementStatuses,
  consecratedStatuses,
  genders,
  maritalStatuses,
} from '@/types/community-member';

export const genderLabels: Record<(typeof genders)[number], string> = {
  male: 'mężczyzna',
  female: 'kobieta',
};

export const maritalStatusLabels: Record<(typeof maritalStatuses)[number], string> = {
  single: 'osoba stanu wolnego',
  married: 'w małżeństwie',
  widowed: 'wdowa / wdowiec',
  consecrated: 'osoba konsekrowana lub seminarzysta',
};

export const consecratedStatusLabels: Record<(typeof consecratedStatuses)[number], string> = {
  priest: 'kapłan',
  deacon: 'diakon',
  seminarian: 'seminarzysta',
  sister: 'siostra konsekrowana',
  brother: 'brat konsekrowany',
};

export const communityEngagementLabels: Record<
  (typeof communityEngagementStatuses)[number],
  string
> = {
  'Looker-On': 'Przyglądający(a) się',
  'In-Probation': 'Na etapie przyjęcia i rozeznania',
  Commited: 'Zaangażowany(a)',
  'In-Fraternity-Probation': 'W okresie próbnym Bractwa Jezusowego',
  Fraternity: 'Konsekrowany(a) w Bractwie Jezusowym',
};

export const accompanyingReadinessLabels: Record<
  (typeof accompanyingReadinesses)[number],
  string
> = {
  'Not Candidate': 'Nie jest kandydatem',
  Candidate: 'Kandydat',
  Ready: 'Gotowy',
  Active: 'Aktywny',
  Overwhelmed: 'Przeciążony',
  Deactivated: 'Dezaktywowany',
};
