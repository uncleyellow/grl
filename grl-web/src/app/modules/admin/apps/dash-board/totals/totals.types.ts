export interface Location {
    address: string;
    lat: number;
    lng: number;
}

export interface Route {
    chuyen: string;
    duongBo: number;
    duongTau: number;
}

export interface RouteWithDistance extends Route {
    distance: number;
}