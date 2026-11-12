import type { Site, SiteInput } from '../../types/domain';

export const DEFAULT_SITE: SiteInput = {
  name: '',
  type: 'antenna',
  status: 'planned',
  lat: 31.77,
  lng: 35.21,
  heightM: 30,
  powerW: 100,
  frequencyMHz: 1800,
};

export function siteToInput(s: Site): SiteInput {
  return {
    name: s.name,
    type: s.type,
    status: s.status,
    lat: s.lat,
    lng: s.lng,
    heightM: s.heightM,
    powerW: s.powerW,
    frequencyMHz: s.frequencyMHz,
  };
}
