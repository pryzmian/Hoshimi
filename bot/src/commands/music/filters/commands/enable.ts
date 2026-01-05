import { createStringOption, Declare, type GuildCommandContext, Options, SubCommand } from "seyfert";

const options = {
    type: createStringOption({
        description: "The filter to enable.",
        required: true,
        choices: [
            { name: "Nightcore", value: "nightcore" },
            { name: "Vaporwave", value: "vaporwave" },
            { name: "LowPass", value: "lowpass" },
            { name: "Karaoke", value: "karaoke" },
            { name: "Rotation", value: "rotation" },
            { name: "Tremolo", value: "tremolo" },
            { name: "Vibrato", value: "vibrato" },
            { name: "Echo (N/A)", value: "echo" },
            { name: "Reverb (N/A)", value: "reverb" },
        ] as const,
    }),
};

@Declare({
    name: "enable",
    description: "Enable a music filter.",
})
@Options(options)
export default class EnableFilterSubcommand extends SubCommand {
    public override async run(ctx: GuildCommandContext<typeof options>) {
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

        switch (options.type) {
            case "nightcore": {
                await player.filterManager.setNightcore({
                    rate: 1.25,
                    pitch: 1.25,
                    speed: 1.25,
                });

                return ctx.editOrReply({
                    content: "Enabled the nightcore filter! The effect will be applied shortly.",
                });
            }

            case "vaporwave": {
                await player.filterManager.setVaporwave({
                    rate: 0.8,
                    pitch: 0.8,
                    speed: 0.8,
                });

                return ctx.editOrReply({
                    content: "Enabled the vaporwave filter! The effect will be applied shortly.",
                });
            }

            case "lowpass": {
                await player.filterManager.setLowPass({
                    smoothing: 20,
                });

                return ctx.editOrReply({
                    content: "Enabled the lowpass filter! The effect will be applied shortly.",
                });
            }

            case "karaoke": {
                await player.filterManager.setKaraoke({
                    level: 1.0,
                    monoLevel: 1.0,
                    filterBand: 220,
                    filterWidth: 100,
                });

                return ctx.editOrReply({
                    content: "Enabled the karaoke filter! The effect will be applied shortly.",
                });
            }
        }
    }
}
