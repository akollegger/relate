import {OnApplicationBootstrap, Module, Inject} from '@nestjs/common';
import {SystemModule, SystemProvider} from '@relate/common';
import path from 'path';

import LinkCommand from '../../commands/extension/link';
import {RequiredArgsError} from '../../errors';

@Module({
    exports: [],
    imports: [SystemModule],
    providers: [],
})
export class LinkModule implements OnApplicationBootstrap {
    constructor(
        @Inject('PARSED_PROVIDER') protected readonly parsed: ParsedInput<typeof LinkCommand>,
        @Inject('UTILS_PROVIDER') protected readonly utils: CommandUtils,
        @Inject(SystemProvider) protected readonly systemProvider: SystemProvider,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        const {args} = this.parsed;
        const {filePath} = args;

        if (!filePath) {
            // @todo: figure this out in combination with TTY
            throw new RequiredArgsError(['filepath']);
        }

        const environment = await this.systemProvider.getEnvironment();
        const resolvedPath = path.resolve(filePath);

        return environment.extensions.link(resolvedPath).then((res) => {
            this.utils.log(res.name);
        });
    }
}
