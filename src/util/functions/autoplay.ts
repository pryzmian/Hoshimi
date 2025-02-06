import type { Player } from "../../classes/Player";
import type { Track } from "../../classes/Track";
import { SearchEngines } from "../../types/Manager";
import { SourceNames } from "../../types/Node";

const maxTracks = 10;

/**
 *
 * The autoplay function for the player.
 * @param player The player for the autoplay function.
 * @param lastTrack The last track that was played.
 * @returns {Promise<void>}
 */
export async function autoplayFn(player: Player, lastTrack: Track | null): Promise<void> {
	if (!lastTrack) return;

	const isEnabled =
		player.get<boolean | undefined>("enabledAutoplay") ||
		player.manager.options.queueOptions.autoPlay;
	if (!isEnabled) return;

	const filter = (tracks: Track[]) =>
		tracks.filter(
			(track) =>
				!(
					player.queue.previous.some(
						(t) => t.info.identifier === track.info.identifier,
					) || lastTrack.info.identifier === track.info.identifier
				),
		);

	switch (lastTrack.info.sourceName) {
		case SourceNames.Spotify: {
			const filtered = player.queue.previous
				.filter(({ info }) => info.sourceName === SourceNames.Spotify)
				.slice(0, 1);
			if (!filtered.length) filtered.push(lastTrack);

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
				const track = filter(res.tracks)[
					Math.floor(Math.random() * res.tracks.length)
				] as Track;
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
				const tracks = filter(res.tracks).slice(random, random + maxTracks) as Track[];
				player.queue.add(tracks);
			}
		}
	}
}
