import gql from 'graphql-tag';
import {List} from '@relate/types';
import {IAuthToken} from '@huboneo/tapestry';

import {IDbms, IDbmsInfo, IDbmsVersion, IDb} from '../../models';

import {DbmssAbstract} from './dbmss.abstract';
import {RemoteEnvironment} from '../environments';
import {PUBLIC_GRAPHQL_METHODS} from '../../constants';
import {GraphqlError, InvalidConfigError, NotSupportedError} from '../../errors';
import {PropertiesFile} from '../../system/files';
import {IRelateFilter} from '../../utils/generic';

export class RemoteDbmss extends DbmssAbstract<RemoteEnvironment> {
    async updateConfig(dbmsId: string, properties: Map<string, string>): Promise<boolean> {
        const {data, errors}: any = await this.environment.graphql({
            query: gql`
                mutation UpdateDbmsConfig(
                    $environmentId: String,
                    $dbmsId: String!,
                    $properties: [[String!, String!]]!
                ) {
                    ${PUBLIC_GRAPHQL_METHODS.UPDATE_DBMS_CONFIG}(
                        environmentNameOrId: $environmentId,
                        dbmsId: $dbmsId,
                        properties: $properties
                    )
                }
            `,
            variables: {
                dbmsId,
                environmentNameOrId: this.environment.remoteEnvironmentId,
                properties: properties.entries(),
            },
        });

        if (errors) {
            throw new GraphqlError(
                'Unable to update dbms config',
                List.from<Error>(errors).mapEach(({message}) => message),
            );
        }

        return data[PUBLIC_GRAPHQL_METHODS.UPDATE_DBMS_CONFIG];
    }

    async versions(filters?: List<IRelateFilter> | IRelateFilter[]): Promise<List<IDbmsVersion>> {
        const {data, errors}: any = await this.environment.graphql({
            /* eslint-disable max-len */
            query: gql`
                query ListDbmsVersions (
                    $environmentId: String,
                    $filters: [RelateSimpleFilter!]
                ) {
                    ${PUBLIC_GRAPHQL_METHODS.LIST_DBMS_VERSIONS}(environmentNameOrId: $environmentId, filters: $filters) {
                        edition
                        version
                        origin
                    }
                }
            `,
            /* eslint-enable max-len */
            variables: {
                environmentNameOrId: this.environment.remoteEnvironmentId,
                filters,
            },
        });

        if (errors) {
            throw new GraphqlError(
                'Unable to list dbms versions',
                List.from<Error>(errors).mapEach(({message}) => message),
            );
        }

        return data[PUBLIC_GRAPHQL_METHODS.LIST_DBMS_VERSIONS];
    }

    async install(name: string, credentials: string, version: string): Promise<string> {
        const {data, errors}: any = await this.environment.graphql({
            query: gql`
                mutation InstallDbms(
                    $environmentId: String
                    $name: String!
                    $credentials: String!
                    $version: String!
                ) {
                    ${PUBLIC_GRAPHQL_METHODS.INSTALL_DBMS}(
                        environmentNameOrId: $environmentId
                        name: $name
                        credentials: $credentials
                        version: $version
                    )
                }
            `,
            variables: {
                credentials,
                environmentNameOrId: this.environment.remoteEnvironmentId,
                name,
                version,
            },
        });

        if (errors) {
            throw new GraphqlError(
                'Unable to install dbms',
                List.from<Error>(errors).mapEach(({message}) => message),
            );
        }

        return data[PUBLIC_GRAPHQL_METHODS.INSTALL_DBMS];
    }

    async uninstall(name: string): Promise<void> {
        const {data, errors}: any = await this.environment.graphql({
            query: gql`
                mutation UninstallDbms($environmentId: String, $name: String!) {
                    ${PUBLIC_GRAPHQL_METHODS.UNINSTALL_DBMS}(environmentNameOrId: $environmentId, name: $name)
                }
            `,
            variables: {
                environmentNameOrId: this.environment.remoteEnvironmentId,
                name,
            },
        });

        if (errors) {
            throw new GraphqlError(
                'Unable to uninstall dbms',
                List.from<Error>(errors).mapEach(({message}) => message),
            );
        }

        return data[PUBLIC_GRAPHQL_METHODS.UNINSTALL_DBMS];
    }

    async get(nameOrId: string): Promise<IDbms> {
        const {data, errors}: any = await this.environment.graphql({
            query: gql`
                query GetDbms($environmentId: String, $nameOrId: String!) {
                    ${PUBLIC_GRAPHQL_METHODS.GET_DBMS}(environmentNameOrId: $environmentId, dbmsId: $nameOrId) {
                        id
                        name
                        description
                        connectionUri
                    }
                }
            `,
            variables: {
                environmentNameOrId: this.environment.remoteEnvironmentId,
                nameOrId,
            },
        });

        if (errors) {
            throw new GraphqlError(
                'Unable to get dbms',
                List.from<Error>(errors).mapEach(({message}) => message),
            );
        }

        const dbms = data[PUBLIC_GRAPHQL_METHODS.GET_DBMS];

        if (!this.environment.httpOrigin) {
            throw new InvalidConfigError('Remote Environments must specify an `httpOrigin`');
        }

        // @todo this is not 100% reliable as the DBMS might be hosted on a
        // different domain.
        const relateUrl = new URL(this.environment.httpOrigin);
        const connectionUri = new URL(dbms.connectionUri);
        connectionUri.hostname = relateUrl.hostname;
        dbms.connectionUri = connectionUri.toString();

        return dbms;
    }

    async list(filters?: List<IRelateFilter> | IRelateFilter[]): Promise<List<IDbms>> {
        const {data, errors}: any = await this.environment.graphql({
            query: gql`
                query ListDbmss($environmentId: String, $filters: [RelateSimpleFilter!]) {
                    ${PUBLIC_GRAPHQL_METHODS.LIST_DBMSS}(environmentNameOrId: $environmentId, filters: $filters) {
                        id
                        name
                        description
                        connectionUri
                    }
                }
            `,
            variables: {
                environmentNameOrId: this.environment.remoteEnvironmentId,
                filters,
            },
        });

        if (errors) {
            throw new GraphqlError(
                'Unable to list dbmss',
                List.from<Error>(errors).mapEach(({message}) => message),
            );
        }

        return List.from(data[PUBLIC_GRAPHQL_METHODS.LIST_DBMSS]);
    }

    async start(namesOrIds: string[]): Promise<List<string>> {
        const {data, errors}: any = await this.environment.graphql({
            query: gql`
                mutation StartDBMSSs($environmentId: String, $namesOrIds: [String!]!) {
                    ${PUBLIC_GRAPHQL_METHODS.START_DBMSS}(environmentNameOrId: $environmentId, dbmsIds: $namesOrIds)
                }
            `,
            variables: {
                environmentNameOrId: this.environment.remoteEnvironmentId,
                namesOrIds,
            },
        });

        if (errors) {
            throw new GraphqlError(
                'Unable to start dbmss',
                List.from<Error>(errors).mapEach(({message}) => message),
            );
        }

        return List.from(data[PUBLIC_GRAPHQL_METHODS.START_DBMSS]);
    }

    async stop(namesOrIds: string[]): Promise<List<string>> {
        const {data, errors}: any = await this.environment.graphql({
            query: gql`
                mutation StopDBMSSs($environmentId: String, $namesOrIds: [String!]!) {
                    ${PUBLIC_GRAPHQL_METHODS.STOP_DBMSS}(environmentNameOrId: $environmentId, dbmsIds: $namesOrIds)
                }
            `,
            variables: {
                environmentNameOrId: this.environment.remoteEnvironmentId,
                namesOrIds,
            },
        });

        if (errors) {
            throw new GraphqlError(
                'Unable to stop dbmss',
                List.from<Error>(errors).mapEach(({message}) => message),
            );
        }

        return List.from(data[PUBLIC_GRAPHQL_METHODS.STOP_DBMSS]);
    }

    async info(namesOrIds: string[]): Promise<List<IDbmsInfo>> {
        const {data, errors}: any = await this.environment.graphql({
            query: gql`
                query InfoDBMSs($environmentId: String, $namesOrIds: [String!]!) {
                    ${PUBLIC_GRAPHQL_METHODS.INFO_DBMSS}(environmentNameOrId: $environmentId, dbmsIds: $namesOrIds) {
                        id
                        name
                        connectionUri
                        version
                        status
                        edition
                    }
                }
            `,
            variables: {
                environmentNameOrId: this.environment.remoteEnvironmentId,
                namesOrIds,
            },
        });

        if (errors) {
            throw new GraphqlError(
                'Unable to info dbmss',
                List.from<Error>(errors).mapEach(({message}) => message),
            );
        }

        return List.from(data[PUBLIC_GRAPHQL_METHODS.INFO_DBMSS]);
    }

    async createAccessToken(appName: string, dbmsNameOrId: string, authToken: IAuthToken): Promise<string> {
        const {data, errors}: any = await this.environment.graphql({
            query: gql`
                mutation AccessDBMS(
                    $environmentId: String
                    $dbmsNameOrId: String!
                    $authToken: AuthTokenInput!
                    $appName: String!
                ) {
                    ${PUBLIC_GRAPHQL_METHODS.CREATE_ACCESS_TOKEN}(
                        environmentNameOrId: $environmentId
                        dbmsId: $dbmsNameOrId
                        appName: $appName
                        authToken: $authToken
                    )
                }
            `,
            variables: {
                appName,
                authToken,
                dbmsNameOrId,
                environmentNameOrId: this.environment.remoteEnvironmentId,
            },
        });

        if (errors) {
            throw new GraphqlError(
                'Unable to create access token',
                List.from<Error>(errors).mapEach(({message}) => message),
            );
        }

        return data[PUBLIC_GRAPHQL_METHODS.CREATE_ACCESS_TOKEN];
    }

    getDbmsConfig(_dbmsId: string): Promise<PropertiesFile> {
        throw new NotSupportedError(`${RemoteDbmss.name} does not support getting DBMS config`);
    }

    dbCreate(_dbmsId: string, _dbmsUser: string, _dbName: string, _accessToken: string): Promise<void> {
        throw new NotSupportedError(`${RemoteDbmss.name} does not support creating databases`);
    }

    dbDrop(_dbmsId: string, _dbmsUser: string, _dbName: string, _accessToken: string): Promise<void> {
        throw new NotSupportedError(`${RemoteDbmss.name} does not support dropping databases`);
    }

    dbDump(dbmsId: string, db: string): Promise<string> {
        throw new NotSupportedError(`Not implemented yet. ${dbmsId} ${db}`);
    }

    dbLoad(dbmsId: string, db: string): Promise<string> {
        throw new NotSupportedError(`Not implemented yet. ${dbmsId} ${db}`);
    }

    dbExec(dbmsId: string, db: string): Promise<string> {
        throw new NotSupportedError(`Not implemented yet. ${dbmsId} ${db}`);
    }

    dbList(_dbmsId: string, _dbmsUser: string, _accessToken: string): Promise<List<IDb>> {
        throw new NotSupportedError(`${RemoteDbmss.name} does not support listing databases`);
    }
}
