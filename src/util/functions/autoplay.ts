import type { Player } from "../../classes/player/Player";
import type { HoshimiTrack, Track } from "../../classes/Track";
import { SearchEngines } from "../../types/Manager";
import { SourceNames } from "../../types/Node";

/**
 * The maximum number of tracks to be added to the queue.
 * @type {number}
 * @default 10
 */
const maxTracks: number = 10;

/**
 *
 * The autoplay function for the player.
 * @param {Player} player The player for the autoplay function.
 * @param {Track | null} lastTrack The last track that was played.
 * @returns {Promise<void>} The promise for the autoplay function.
 */
export async function autoplayFn(player: Player, lastTrack: HoshimiTrack | null): Promise<void> {
	if (!lastTrack) return;

	const isEnabled =
		!!player.data.get("enabledAutoplay") || player.manager.options.queueOptions.autoPlay;
	if (!isEnabled) return;

	/**
	 *
	 * Filter the tracks to remove the last track and the previous tracks.
	 * @param {Track[]} tracks The tracks to filter.
	 * @returns {Track[]} The filtered tracks.
	 */
	const filter = (tracks: Track[]): Track[] =>
		tracks.filter(
			(track) =>
				!(
					player.queue.history.some((t) => t.info.identifier === track.info.identifier) ||
					lastTrack.info.identifier === track.info.identifier
				),
		);

	switch (lastTrack.info.sourceName) {
		case SourceNames.Spotify: {
			const filtered = player.queue.history
				.filter(({ info }) => info.sourceName === SourceNames.Spotify)
				.slice(0, 1);
			if (!filtered.length) filtered.push(lastTrack as Track);

			const ids = filtered.map(
				({ info }) =>
					info.identifier ??
					info.uri?.split("/").reverse()?.[0] ??
					info.uri?.split("/").reverse()?.[1],
			);
			const res = await player.search({
				query: `seed_tracks=${ids.join(",")}`,
				engine: SearchEngines.SpotifyRecommendations,
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
			const search = `https://www.youtube.com/watch?v=${lastTrack.info.identifier}&list=RD${lastTrack.info.identifier}`;
			const res = await player.search({
				query: search,
				requester: lastTrack.requester,
			});

			if (res.tracks.length) {
				const random = Math.floor(Math.random() * res.tracks.length);
				const tracks = filter(res.tracks).slice(random, random + maxTracks);

				player.queue.add(tracks);
			}
		}
	}
}
