import { DataEntity } from './';

export interface SwitchingDetailEntity {
    site: DataEntity;
	nmid: DataEntity;
	category: DataEntity;
}

export interface SwitchingEntity {
    tag: string;
    content: string;
    data: string;
    detail: SwitchingDetailEntity;
}