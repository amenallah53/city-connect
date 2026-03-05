export interface User {
    id: string;
    cin: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    role: 'CLIENT' | 'PRESTATAIRE' | 'ADMIN';
    profilePictureUrl?: string;
    // Add other common user properties as needed
}