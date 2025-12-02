import { IUserExcelModel } from "./IUserExcelModel";

export interface IExcelAnalysis {
    totalRecords?: number;
    duplicatedRecords?: number;
    duplicatedRecordsList?: any[];
    uniqueRecordsNumber?: number;
    uniqueRecords?: IUniqueRecordsFromExcel[];
    fileName?: string;
    fileSize?: string; 
    ouAnalysis?: { department: string; userCount: number }[];
    invalidRecords?: number;
    invalidRecordsList?: InvalidRecords[];
}

export interface InvalidRecords{
    email?: string;
    phoneNumber?: string;
    reason?: string[];
}

export interface IUniqueRecordsFromExcel{
    department : string,
    uniqueUsers : IUserExcelModel[]
}