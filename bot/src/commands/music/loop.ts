import { LoopMode } from "hoshimi";
import { Command, createStringOption, Declare, type GuildCommandContext, type OKFunction, Options } from "seyfert";

const options = {
    mode: createStringOption({
        description: "Loop mode to set.",
        value: ({ value }, ok: OKFunction<number>): void => ok(Number.parseInt(value, 10)),
        choices: [
            { name: "off", value: "1" },
            { name: "track", value: "2" },
            { name: "queue", value: "3" },
        ] as const,
    }),
};

@Declare({
    name: "loop",
    description: "Set the loop mode.",
    aliases: ["l"],
    integrationTypes: ["GuildInstall"],
    contexts: ["Guild"],
})
@Options(options)
export default class SkipCommand extends Command {
    override async run(ctx: GuildCommandContext<typeof options>) {
        const { client, options } = ctx;

        const state = await ctx.member.voice();
        if (!state.channelId)
            return ctx.editOrReply({
                content: "You need to be in a voice channel to use this command.",
            });

        const me = await ctx.me();
        const bot = await me.voice();

        if (bot && bot.channelId !== state.channelId) return ctx.editOrReply({ content: "I'm already in a voice channel." });

        const player = client.manager.getPlayer(ctx.guildId);
        if (!player) return ctx.editOrReply({ content: "No player found." });

        if (options.mode) {
            player.setLoop(options.mode);

            await ctx.editOrReply({ content: `Loop mode set to **${LoopMode[options.mode]}**.` });
        } else {
            const loopTypes: Record<LoopMode, LoopMode> = {
                [LoopMode.Off]: LoopMode.Track,
                [LoopMode.Track]: LoopMode.Queue,
                [LoopMode.Queue]: LoopMode.Off,
            };

            const loopMode = loopTypes[player.loop];

            player.setLoop(loopMode);

            await ctx.editOrReply({ content: `Loop mode set to **${LoopMode[loopMode]}**.` });
        }
    }
}
