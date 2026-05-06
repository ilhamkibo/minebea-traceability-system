import { PaginationParams } from "./pagination";

export interface OperatorParams extends PaginationParams {
    role?: string;
}

export interface Operator {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface OperatorFormData {
    name: string;
    pin: string;
}
