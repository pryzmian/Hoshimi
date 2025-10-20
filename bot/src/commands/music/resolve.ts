import { AttachmentBuilder, Command, createStringOption, Declare, Formatter, Options, type GuildCommandContext } from "seyfert";
import { isBase64, omitKeys } from "../../utils";
import { LoadType } from "hoshimi";

const options = {
    query: createStringOption({
        description: "The encoded track to resolve.",
        required: true,
    }),
};

@Declare({
    name: "decode",
    description: "Decode a track using the encoded track.",
    aliases: ["r"],
    integrationTypes: ["GuildInstall"],
    contexts: ["Guild"],
})
@Options(options)
export default class DecodeCommand extends Command {
    override async run(ctx: GuildCommandContext<typeof options>) {
        const { client } = ctx;

        if (!client.manager.isUseable())
            return ctx.editOrReply({
                content: "The bot is not connected to any node. For now is not useable.",
            });

        const node = client.manager.nodeManager.getLeastUsed();

        // the most funnier code i've ever written in this thing.
        if (isBase64(ctx.options.query)) {
            const decode = await node.decode.single(ctx.options.query, {
                ...omitKeys(ctx.author, ["client"]),
                global_name: ctx.author.username,
                tag: ctx.author.tag,
            });

            const stringified = JSON.stringify(omitKeys(decode, ["requester"]), null, 2);
            if (stringified.length > 2000) {
                const buffer = Buffer.from(stringified, "utf-8");
                const attachment = new AttachmentBuilder().setFile("buffer", buffer);

                return ctx.editOrReply({
                    content: "The decoded track is too long, here is the file:",
                    files: [attachment],
                });
            }

            return ctx.editOrReply({
                content: Formatter.codeBlock(stringified, "json"),
            });
        }

        const search = await node.search({ query: ctx.options.query });
        if (!search) return ctx.editOrReply({ content: "No results found." });

        switch (search.loadType) {
            case LoadType.Search:
            case LoadType.Track: {
                const track = Array.isArray(search.data) ? search.data[0] : search.data;

                const stringified = JSON.stringify(track, null, 2);
                if (stringified.length > 2000) {
                    const buffer = Buffer.from(stringified, "utf-8");
                    const attachment = new AttachmentBuilder().setFile("buffer", buffer).setName("results.json");

                    return ctx.editOrReply({
                        content: "The resolved track is too long, here is the file:",
                        files: [attachment],
                    });
                }

                return ctx.editOrReply({
                    content: Formatter.codeBlock(stringified, "json"),
                });
            }

            case LoadType.Playlist: {
                const playlist = search.data.tracks;
                const stringified = JSON.stringify(playlist, null, 2);
                if (stringified.length > 2000) {
                    const buffer = Buffer.from(stringified, "utf-8");
                    const attachment = new AttachmentBuilder().setFile("buffer", buffer).setName("playlist.json");

                    return ctx.editOrReply({
                        content: "The resolved playlist is too long, here is the file:",
                        files: [attachment],
                    });
                }

                return ctx.editOrReply({
                    content: Formatter.codeBlock(stringified, "json"),
                });
            }

            case LoadType.Empty: {
                const stringified = JSON.stringify(search, null, 2);
                const codeblock = Formatter.codeBlock(stringified, "json");

                return ctx.editOrReply({ content: codeblock });
            }

            case LoadType.Error:
                return ctx.editOrReply({ content: "No results found." });
        }
    }
}
