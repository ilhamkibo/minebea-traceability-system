import { PaginationParams } from "./pagination";

export interface OperatorParams extends PaginationParams {
    role?: string;
}

export interface Operator {
    id: number;
    name: string;
    assigned: boolean;
    workPosition?: string[];
}

export interface CurrentOperator {
    id: number;
    name: string;
    assigned: boolean;
    workPosition: string[];
}

export interface OperatorAssignmentPayload {
    id: string;
    workPosition: number[];
}

export interface OperatorFormData {
    name: string;
    pin: string;
}

export interface AssignmentRow {
    label: string
    assignPosition: number
    operatorId: string
}