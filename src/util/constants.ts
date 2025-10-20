import { SourceNames, type UserAgent } from "../types/Node";
import { SearchEngines } from "../types/Manager";

import PackageJson from "../../package.json";
import { AudioOutput } from "../types/Filters";
import type { ChannelMixSettings } from "../types/Filters";

/**
 * The user agent for Hoshimi.
 * @type {UserAgent}
 */
export const HoshimiAgent: UserAgent = `hoshimi/v${PackageJson.version} (${PackageJson.repository.url})`;

/**
 * The url regex for Hoshimi.
 * @type {RegExp}
 */
export const UrlRegex: RegExp = /^(https?:\/\/)?([a-zA-Z0-9\-_]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;

/**
 * The valid search engines for Hoshimi.
 * @type {SearchEngines[]}
 */
export const ValidEngines: SearchEngines[] = Object.values(SearchEngines);

/**
 * The valid sources for Hoshimi.
 * @type {Map<SourceNames, SearchEngines>}
 */
export const ValidSources: Map<SourceNames, SearchEngines> = new Map(
    Object.entries<SearchEngines>({
        [SourceNames.Youtube]: SearchEngines.Youtube,
        [SourceNames.YoutubeMusic]: SearchEngines.YoutubeMusic,
        [SourceNames.Soundcloud]: SearchEngines.SoundCloud,
        [SourceNames.Bandcamp]: SearchEngines.BandCamp,
        [SourceNames.Twitch]: SearchEngines.Twitch,
        [SourceNames.Vimeo]: SearchEngines.Vimeo,
        [SourceNames.Mixer]: SearchEngines.Mixer,
        [SourceNames.Spotify]: SearchEngines.Spotify,
        [SourceNames.Deezer]: SearchEngines.Deezer,
        [SourceNames.AppleMusic]: SearchEngines.AppleMusic,
        [SourceNames.YandexMusic]: SearchEngines.YandexMusic,
        [SourceNames.FloweryTTS]: SearchEngines.FloweryTTS,
        [SourceNames.JioSaavn]: SearchEngines.JioSaavn,
        [SourceNames.VKMusic]: SearchEngines.VKMusic,
        [SourceNames.Tidal]: SearchEngines.Tidal,
        [SourceNames.TextToSpeech]: SearchEngines.TextToSpeech,
        [SourceNames.PornHub]: SearchEngines.PornHub,
    }) as [SourceNames, SearchEngines][],
);

/**
 * The audio output data for Hoshimi.
 * @type {Record<AudioOutput, ChannelMixSettings>}
 */
export const AudioOutputData: Record<AudioOutput, ChannelMixSettings> = {
    [AudioOutput.Mono]: {
        leftToLeft: 0.5,
        leftToRight: 0.5,
        rightToLeft: 0.5,
        rightToRight: 0.5,
    },
    [AudioOutput.Stereo]: {
        leftToLeft: 1,
        leftToRight: 0,
        rightToLeft: 0,
        rightToRight: 1,
    },
    [AudioOutput.Left]: {
        leftToLeft: 1,
        leftToRight: 0,
        rightToLeft: 1,
        rightToRight: 0,
    },
    [AudioOutput.Right]: {
        leftToLeft: 0,
        leftToRight: 1,
        rightToLeft: 0,
        rightToRight: 1,
    },
};
