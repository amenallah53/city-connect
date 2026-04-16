/*export interface HoraireService {
  id: string;
  type: string;
  nom: string;
  date_deb: string;
  date_fin: string;
  jour: string;
  municipalite_id?: number;
}*/

export interface HoraireService {
  id: string;
  type?: string;
  name?: string;
  heureDeb: string;     // e.g. "07:00"
  heureFin?: string;    // e.g. "15:00"
  days?: string[];      // e.g. ['Monday', 'Tuesday']
  municipaliteId?: number;
}