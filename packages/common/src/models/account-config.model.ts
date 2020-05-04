import {IsEnum, IsNotEmpty, IsString, IsOptional} from 'class-validator';

import {ACCOUNT_TYPES} from '../accounts';
import {ModelAbstract} from './model.abstract';
import {NEO4J_EDITION, NEO4J_ORIGIN} from '../accounts/account.constants';
import {PropertiesFile} from '../system/files';

export interface IDbms {
    id: string;
    name: string;
    description: string;
    connectionUri: string;
    config: PropertiesFile;
}

export interface IDbmsVersion {
    edition: NEO4J_EDITION;
    version: string;
    dist: string;
    origin: NEO4J_ORIGIN;
}

export interface IAccountConfig {
    id: string;
    user: any;
    neo4jDataPath?: string;
    type: ACCOUNT_TYPES;
    dbmss?: {[key: string]: IDbms};
}

export class AccountConfigModel extends ModelAbstract<IAccountConfig> implements IAccountConfig {
    // @todo: should be uuid
    @IsString()
    public id!: string;

    // @todo: should be typed
    @IsNotEmpty()
    public user: any;

    @IsEnum(ACCOUNT_TYPES)
    public type!: ACCOUNT_TYPES;

    // @todo: this is LocalAccount specific
    @IsString()
    @IsOptional()
    public neo4jDataPath?: string;

    // @todo: this is RemoteAccount specific
    @IsString()
    @IsOptional()
    public relateURL?: string;

    // @todo: this is RemoteAccount specific
    @IsString()
    @IsOptional()
    public relateAccount?: string;

    @IsOptional()
    public dbmss?: {[key: string]: IDbms};
}
