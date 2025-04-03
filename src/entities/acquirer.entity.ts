import { DataEntity } from './';

export interface AcquirerDetailEntity {
	site: DataEntity;
    mpan: DataEntity;
    terminal_id: DataEntity;
    category: DataEntity;
}

export interface AcquirerEntity {
    tag: string;
    content: string;
    data: string;
    detail: AcquirerDetailEntity;
}