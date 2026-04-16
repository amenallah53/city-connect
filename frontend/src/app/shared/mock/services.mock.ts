import { Service } from "../models/service.model";

export const allServices: Service[] = [
  {
    id: '1',
    name: 'Issuing a building permit',
    type: 'Building permits',
    badges: ['Electronic', 'Not immediate'],
    description: 'Official authorization required before construction of a new building or structure can legally begin.',
    requirements: [
      'Completed application form',
      'Architectural plans signed by a licensed engineer',
      'Proof of land ownership or lease agreement',
      'Site plan and layout drawings',
      'Payment of applicable fees'
    ]
  },
  {
    id: '2',
    name: 'Printing a burial certificate',
    type: 'Honoring the dead',
    badges: ['Electronic'],
    description: 'Official document certifying the burial of a deceased individual, required for legal and administrative purposes.',
    requirements: [
      'Death certificate (original or certified copy)',
      'National ID of the requesting party',
      'Proof of relationship to the deceased',
      'Completed request form'
    ]
  },
  {
    id: '3',
    name: 'Renewing a business license',
    type: 'Business licenses',
    badges: ['Not immediate'],
    description: 'Renewal of an existing business operating license to ensure continued legal operation within the municipality.',
    requirements: [
      'Previous business license (original)',
      'Tax clearance certificate',
      'Updated commercial register extract',
      'Proof of business address',
      'Payment of renewal fees'
    ]
  },
  {
    id: '4',
    name: 'Issuing a building demolition permit',
    type: 'Building permits',
    badges: ['Electronic', 'Not immediate'],
    description: 'Authorization required to legally demolish an existing structure, ensuring safety and compliance with municipal regulations.',
    requirements: [
      'Completed demolition permit application',
      'Proof of property ownership',
      'Structural assessment report by a licensed engineer',
      'Utility disconnection confirmations (water, electricity, gas)',
      'Environmental impact statement if applicable'
    ]
  },
  {
    id: '5',
    name: 'Issuing a construction modification permit',
    type: 'Building permits',
    badges: ['Electronic', 'Not immediate'],
    description: 'Permit required to make structural modifications or extensions to an already approved and existing building.',
    requirements: [
      'Original building permit',
      'Updated architectural modification plans',
      'Engineer approval letter',
      'Proof of ownership',
      'Completed modification request form'
    ]
  },
  {
    id: '6',
    name: 'Issuing a death certificate copy',
    type: 'Honoring the dead',
    badges: ['Electronic'],
    description: 'Official certified copy of a death certificate issued by the municipality for legal, inheritance, or administrative use.',
    requirements: [
      'National ID of the requesting party',
      'Proof of relationship to the deceased',
      'Original death record reference number',
      'Completed request form'
    ]
  },
  {
    id: '7',
    name: 'Issuing a new business license',
    type: 'Business licenses',
    badges: ['Not immediate'],
    description: 'First-time issuance of a business operating license for newly established commercial entities within the municipality.',
    requirements: [
      'Commercial register certificate',
      'Lease or ownership proof for business premises',
      'National ID of the business owner',
      'Tax registration certificate',
      'Health and safety compliance certificate (if applicable)',
      'Payment of licensing fees'
    ]
  },
  {
    id: '8',
    name: 'Issuing a fence construction permit',
    type: 'Building permits',
    badges: ['Electronic', 'Not immediate'],
    description: 'Authorization to construct a perimeter fence or boundary wall around a property in accordance with local zoning rules.',
    requirements: [
      'Proof of land ownership',
      'Site plan showing fence location and dimensions',
      'Completed permit application form',
      'Neighbor consent letter (if shared boundary)',
      'Payment of applicable fees'
    ]
  },
  {
    id: '9',
    name: 'Issuing a temporary occupation permit',
    type: 'Building permits',
    badges: ['Electronic', 'Not immediate'],
    description: 'Temporary permit allowing partial occupancy of a newly constructed building while final inspections are still pending.',
    requirements: [
      'Building permit (original)',
      'Partial completion inspection report',
      'Request letter from the property owner',
      'Engineer certification of safe occupancy',
      'Payment of permit fees'
    ]
  },
  {
    id: '10',
    name: 'Transferring a burial plot',
    type: 'Honoring the dead',
    badges: ['Electronic'],
    description: 'Administrative process to transfer the ownership or usage rights of a burial plot to another individual or family.',
    requirements: [
      'Original burial plot allocation document',
      'National IDs of both transferring and receiving parties',
      'Death certificate of plot holder (if applicable)',
      'Completed transfer request form',
      'Payment of transfer fees'
    ]
  },
  {
    id: '11',
    name: 'Suspending a business license',
    type: 'Business licenses',
    badges: ['Not immediate'],
    description: 'Formal request to temporarily suspend a business license due to renovation, seasonal closure, or other administrative reasons.',
    requirements: [
      'Original business license',
      'Written justification letter',
      'National ID of the business owner',
      'Estimated suspension duration statement'
    ]
  },
  {
    id: '12',
    name: 'Issuing a signage installation permit',
    type: 'Building permits',
    badges: ['Electronic', 'Not immediate'],
    description: 'Permit required to install commercial signage or billboards on a building facade or public-facing property.',
    requirements: [
      'Business license copy',
      'Sign design and dimensions drawing',
      'Structural attachment plan',
      'Proof of property ownership or landlord authorization',
      'Payment of signage permit fees'
    ]
  }
];