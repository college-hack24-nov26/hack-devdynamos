export interface FarmerRecord {
    land_id: string;
    land_owner_name: string;
    aadhaar_number: string;
    aadhaar_drive_link: string;
    seven_twelve_drive_link: string;
    coord_1: number;
    coord_2: number;
    coord_3: number;
    coord_4: number;
    coord_5: number;
    coord_6: number;
    coord_7?: number;
    coord_8?: number;
    request_status: 'Pending' | 'Verified' | 'Rejected';
    survey_number?: string;
    total_area?: number;
}

export interface StatusCounts {
    total: number;
    pending: number;
    verified: number;
    rejected: number;
}
