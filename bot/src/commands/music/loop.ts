import { LoopMode } from "hoshimi";
import { Command, createNumberOption, Declare, type GuildCommandContext, Options } from "seyfert";

const options = {
    mode: createNumberOption({
        description: "Loop mode to set.",
        choices: [
            { name: "Track", value: LoopMode.Track },
            { name: "Queue", value: LoopMode.Queue },
            { name: "Off", value: LoopMode.Off },
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
export default class LoopCommand extends Command {
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
