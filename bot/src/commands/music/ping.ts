import { Command, type CommandContext, Declare } from "seyfert";

@Declare({
    name: "ping",
    description: "Check the bot's latency.",
    aliases: ["latency"],
})
export default class PingCommand extends Command {
    public override async run(ctx: CommandContext): Promise<void> {
        const { client } = ctx;

        const wsPing = Math.floor(client.gateway.latency);
        const clientPing = Math.floor(Date.now() - (ctx.message ?? ctx.interaction)!.createdTimestamp);
        const shardPing = Math.floor((await ctx.client.gateway.get(ctx.shardId)?.ping()) ?? 0);

        await ctx.editOrReply({
            content: `🏓 Pong! | **Socket:** \`${wsPing}ms\` | **Client:** \`${clientPing}ms\` | **Shard:** \`${shardPing}ms\``,
        });
    }
}
