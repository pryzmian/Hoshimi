import { type HoshimiTrack, type PlayerStructure, SearchEngines, SourceNames, type TrackStructure } from "hoshimi";

/**
 * The maximum number of tracks to be added to the queue.
 * @type {number}
 * @default 10
 */
const max: number = 10;

/**
 *
 * The autoplay function for the player.
 * @param {PlayerStructure} player The player for the autoplay function.
 * @param {HoshimiTrack | null} lastTrack The last track that was played.
 * @returns {Promise<void>} The promise for the autoplay function.
 */
export async function autoplayFn(player: PlayerStructure, lastTrack: HoshimiTrack | null): Promise<void> {
    if (!lastTrack) return;

    const isEnabled = !!(await player.data.get("enabledAutoplay")) || player.manager.options.queueOptions.autoPlay;
    if (!isEnabled) return;

    /**
     *
     * Filter the tracks to remove the last track and the previous tracks.
     * @param {TrackStructure[]} tracks The tracks to filter.
     * @returns {TrackStructure[]} The filtered tracks.
     */
    const filter = (tracks: TrackStructure[]): TrackStructure[] =>
        tracks.filter(
            (track) =>
                !(
                    player.queue.history.some((t) => t.info.identifier === track.info.identifier) ||
                    lastTrack.info.identifier === track.info.identifier
                ),
        );

    switch (lastTrack.info.sourceName) {
        case SourceNames.Spotify: {
            if (!lastTrack.info.identifier) return;

            const res = await player.search({
                query: lastTrack.info.identifier,
                engine: SearchEngines.SpotifyTrackMix,
                requester: lastTrack.requester,
            });

            if (res.tracks.length) {
                const index = Math.floor(Math.random() * res.tracks.length);

                const track = filter(res.tracks)[index];
                if (!track) return;

                player.queue.add(track);
            }
            break;
        }

        case SourceNames.Youtube:
        case SourceNames.YoutubeMusic: {
            if (!lastTrack.info.identifier) return;

            const search = `https://www.youtube.com/watch?v=${lastTrack.info.identifier}&list=RD${lastTrack.info.identifier}`;
            const res = await player.search({
                query: search,
                requester: lastTrack.requester,
            });

            if (res.tracks.length) {
                const random = Math.floor(Math.random() * res.tracks.length);
                const tracks = filter(res.tracks).slice(random, random + max);

                player.queue.add(tracks);
            }
        }
    }
}
