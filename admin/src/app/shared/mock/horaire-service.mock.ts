import { HoraireService } from "../models/horaire-service.model";

export const MOCK_HORAIRE_SERVICES: HoraireService[] = [
  {
    id: '1',
    name: 'Household waste collection',
    type: 'Collection',
    heureDeb: '07:00 AM',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    municipaliteId: 1
  },
  {
    id: '2',
    name: 'Household waste collection',
    type: 'Collection',
    heureDeb: '07:00 AM',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    municipaliteId: 1
  },
  {
    id: '3',
    name: 'Civil Registry Office',
    type: 'Administration',
    heureDeb: '07:00 AM',
    heureFin: '03:00 PM',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    municipaliteId: 1
  },
  {
    id: '4',
    name: 'Household waste collection',
    type: 'Collection',
    heureDeb: '07:00 AM',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    municipaliteId: 1
  },
  {
    id: '5',
    name: 'Public Library',
    type: 'Education',
    heureDeb: '08:00 AM',
    heureFin: '06:00 PM',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    municipaliteId: 1
  },
  {
    id: '6',
    name: 'Health Center',
    type: 'Health',
    heureDeb: '08:00 AM',
    heureFin: '04:00 PM',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    municipaliteId: 1
  }
];
