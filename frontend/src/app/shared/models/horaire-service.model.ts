export interface HoraireService {
  id: string;
  type: string;
  nom: string;
  date_deb: string;
  date_fin: string;
  jour: string;
  municipalite_id?: number;
}