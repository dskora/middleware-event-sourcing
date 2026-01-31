export type AdapterResult<TCommand = unknown> = {
    commandName: string;
    command: TCommand;
};

export type CommandTransform = {
    supports: (payload: any) => boolean;
    toCommand: (payload: any) => unknown;
};

export type CommandTransforms = Record<string, CommandTransform>;

export abstract class AdapterAbstract {
    abstract support(): CommandTransforms;

    adapt(payload: any): AdapterResult | null {
        for (const [commandName, { supports, toCommand }] of Object.entries(this.support())) {
            if (supports(payload)) {
                return {
                    commandName,
                    command: toCommand(payload),
                };
            }
        }

        return null;
    }
}
