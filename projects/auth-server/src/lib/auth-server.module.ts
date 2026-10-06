import { DynamicModule, Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { APP_GUARD, DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { TPermission } from '@rt-tools/auth-contract';

import { accessAuditError, TControllerClass, undeclaredAccess } from './access-audit';
import { AuthGuard } from './auth.guard';
import { AUTH_SERVER_OPTIONS, AUTH_TOKEN_VERIFIER } from './auth.tokens';
import { ICatalogSyncOptions, ICatalogSyncResult, syncPermissionCatalog } from './catalog-sync';
import { ITokenCheckOptions, KeycloakTokenVerifier } from './token-verifier';

/** What an admin server tells the module. */
export interface IAuthServerOptions extends ITokenCheckOptions {
    /** Every right of this admin — `definePermissions(…)` of the contract. */
    readonly catalog: readonly TPermission[];
    /** Where the catalog is sent at start; without it nothing is sent. */
    readonly sync?: Omit<ICatalogSyncOptions, 'clientId'>;
}

/**
 * At start: every operation declares exactly one access, and the catalog reaches Keycloak.
 *
 * An operation without a declaration or with two stops the start and is named; the catalog sync
 * creates the roles Keycloak lacks and names the extra ones in the log.
 */
export class AuthStartCheck implements OnApplicationBootstrap {
    readonly #discovery: DiscoveryService;
    readonly #options: IAuthServerOptions;
    readonly #logger: Logger = new Logger('AuthServer');

    constructor(discovery: DiscoveryService, options: IAuthServerOptions) {
        this.#discovery = discovery;
        this.#options = options;
    }

    public async onApplicationBootstrap(): Promise<void> {
        const controllers: TControllerClass[] = this.#discovery
            .getControllers()
            .map((wrapper: InstanceWrapper): unknown => wrapper.metatype)
            .filter((metatype: unknown): metatype is TControllerClass => typeof metatype === 'function');
        const faults: readonly string[] = undeclaredAccess(controllers);
        if (faults.length) {
            throw accessAuditError(faults);
        }
        if (this.#options.sync) {
            const result: ICatalogSyncResult = await syncPermissionCatalog(
                { ...this.#options.sync, clientId: this.#options.clientId },
                this.#options.catalog
            );
            this.#logger.log(`catalog: ${this.#options.catalog.length} rights, created ${result.created.length}`);
            if (result.extra.length) {
                this.#logger.warn(`Keycloak holds rights the catalog lacks: ${result.extra.join(', ')}`);
            }
        }
    }
}

/** The entry module of an admin server: the token check, the guard and the start check. */
@Module({})
export class AuthServerModule {
    public static forRoot(options: IAuthServerOptions): DynamicModule {
        return {
            module: AuthServerModule,
            global: true,
            imports: [DiscoveryModule],
            providers: [
                { provide: AUTH_SERVER_OPTIONS, useValue: options },
                { provide: AUTH_TOKEN_VERIFIER, useValue: new KeycloakTokenVerifier(options) },
                { provide: APP_GUARD, useClass: AuthGuard },
                {
                    provide: AuthStartCheck,
                    useFactory: (discovery: DiscoveryService): AuthStartCheck => new AuthStartCheck(discovery, options),
                    inject: [DiscoveryService],
                },
            ],
            exports: [AUTH_TOKEN_VERIFIER],
        };
    }
}
