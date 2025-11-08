import PackageJson from "../../package.json";
import type { ChannelMixSettings, FilterSettings } from "../types/Filters";
import { AudioOutput } from "../types/Filters";
import { SearchEngines } from "../types/Manager";
import { SourceNames, type UserAgent } from "../types/Node";

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
 * @type {Record<AudioOutput, Required<ChannelMixSettings>>}
 */
export const AudioOutputData: Record<AudioOutput, Required<ChannelMixSettings>> = {
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

/**
 * The default filter presets.
 * @constant {Object} DefaultFilter
 */
export const DefaultFilterPreset = Object.freeze({
    Karaoke: { level: 1, monoLevel: 1, filterBand: 220, filterWidth: 100 },
    Vaporwave: { speed: 0.8500000238418579, pitch: 0.800000011920929, rate: 1 },
    Nightcore: { speed: 1.289999523162842, pitch: 1.289999523162842, rate: 0.9365999523162842 },
    Lowpass: { smoothing: 20 },
    Tremolo: { frequency: 4, depth: 0.8 },
    Vibrato: { frequency: 4, depth: 0.8 },
    Distortion: { cosOffset: 0.4, sinOffset: 0.4, tanOffset: 0.4, offset: 0.4, scale: 1.5, cosScale: 1.5, sinScale: 1.5, tanScale: 1.5 },

    DSPXHighPass: { boostFactor: 1.0, cutoffFrequency: 80 },
    DSPXLowPass: { boostFactor: 1.0, cutoffFrequency: 80 },
    DSPXNormalization: { adaptive: true, maxAmplitude: 0.1 },
    DSPXEcho: { decay: 0.5, echoLength: 0.5 },

    PluginEcho: { decay: 0.8, delay: 4 },
    PluginReverb: { delays: [0.037, 0.042, 0.048, 0.053], gains: [0.84, 0.83, 0.82, 0.81] },
});

/**
 * The default filter settings.
 * @constant {FilterSettings} DefaultFilters
 */
export const DefaultPlayerFilters: Readonly<FilterSettings> = Object.freeze({
    volume: 1,
    lowPass: {
        smoothing: 0,
    },
    karaoke: {
        level: 0,
        monoLevel: 0,
        filterBand: 0,
        filterWidth: 0,
    },
    timescale: {
        speed: 1,
        pitch: 1,
        rate: 1,
    },
    rotation: {
        rotationHz: 0,
    },
    tremolo: {
        frequency: 0,
        depth: 0,
    },
    vibrato: {
        frequency: 0,
        depth: 0,
    },
    pluginFilters: {
        "high-pass": {
            boostFactor: 0,
            cutoffFrequency: 0,
        },
        "low-pass": {
            boostFactor: 0,
            cutoffFrequency: 0,
        },
        "lavalink-filter-plugin": {
            echo: {
                delay: 0,
                decay: 0,
            },
            reverb: {
                delays: [],
                gains: [],
            },
        },
        echo: {
            decay: 0,
            delay: 0,
            echoLength: 0,
        },
        normalization: {
            adaptive: false,
            maxAmplitude: 0,
        },
    },
    equalizer: [],
    distortion: {
        cosOffset: 0,
        sinOffset: 0,
        tanOffset: 0,
        offset: 0,
        scale: 1,
        cosScale: 1,
        sinScale: 1,
        tanScale: 1,
    },
    channelMix: AudioOutputData.mono,
});
