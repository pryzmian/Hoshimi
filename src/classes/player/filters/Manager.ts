import {
    AudioOutput,
    type TimescaleSettings,
    type EnabledPlayerFilters,
    type EQBandSettings,
    type FilterSettings,
    type LowPassSettings,
    type TremoloSettings,
    type KaraokeSettings,
    type FilterType,
} from "../../../types/Filters";
import type { RestOrArray } from "../../../types/Manager";
import type { PlayerStructure } from "../../../types/Structures";
import { AudioOutputData, DefaultFilterPreset, DefaultPlayerFilters } from "../../../util/constants";
import { PlayerError } from "../../Errors";
import { DSPXPluginFilter } from "./DSPXPlugin";
import { LavalinkPluginFilter } from "./LavalinkPlugin";

/**
 * Class representing a filter manager for a player.
 * @class FilterManager
 */
export class FilterManager {
    /**
     * The player this filter manager belongs to.
     * @type {PlayerStructure}
     * @public
     * @readonly
     */
    public readonly player: PlayerStructure;

    /**
     * The bands applied to the player.
     * @type {EQBandSettings[]}
     * @readonly
     */
    public readonly bands: EQBandSettings[] = [];

    /**
     * The current filter settings applied to the player.
     * @type {FilterSettings}
     * @public
     */
    public data: FilterSettings = DefaultPlayerFilters;

    /**
     * The enabled filters for the player.
     * @type {EnabledPlayerFilters}
     * @readonly
     */
    public readonly filters: EnabledPlayerFilters = {
        audioOutput: AudioOutput.Stereo,
        volume: false,
        vaporwave: false,
        custom: false,
        nightcore: false,
        rotation: false,
        karaoke: false,
        tremolo: false,
        vibrato: false,
        lowPass: false,
        lavalinkFilterPlugin: {
            echo: false,
            reverb: false,
        },
        lavalinkLavaDspxPlugin: {
            lowPass: false,
            highPass: false,
            normalization: false,
            echo: false,
        },
    };

    /**
     * The lavalink plugin filters manager.
     * @type {LavalinkPluginFilter}
     * @readonly
     */
    readonly plugin: LavalinkPluginFilter;

    /**
     * The DSPX plugin filters manager.
     * @type {DSPXPluginFilter}
     * @readonly
     */
    readonly dspx: DSPXPluginFilter;

    /**
     *
     * Creates a new filter manager.
     * @param {PlayerStructure} player The player this filter manager belongs to.
     */
    constructor(player: PlayerStructure) {
        this.player = player;
        this.plugin = new LavalinkPluginFilter(this);
        this.dspx = new DSPXPluginFilter(this);
    }

    /**
     *
     * Checks if a custom filter is active.
     * @returns {boolean} True if a custom filter is active, false otherwise.
     */
    public isCustomActive(): boolean {
        this.filters.custom =
            !this.filters.nightcore && !this.filters.vaporwave && Object.values(this.data.timescale ?? {}).some((d) => d !== 1);
        return this.filters.custom;
    }

    /**
     * Resets all filters to their default values.
     * @returns {Promise<void>} A promise that resolves when the filters have been reset.
     */
    public async reset(): Promise<void> {
        this.filters.audioOutput = AudioOutput.Stereo;
        this.filters.lavalinkLavaDspxPlugin.echo = false;
        this.filters.lavalinkLavaDspxPlugin.normalization = false;
        this.filters.lavalinkLavaDspxPlugin.highPass = false;
        this.filters.lavalinkLavaDspxPlugin.lowPass = false;
        this.filters.lavalinkFilterPlugin.echo = false;
        this.filters.lavalinkFilterPlugin.reverb = false;
        this.filters.nightcore = false;
        this.filters.lowPass = false;
        this.filters.rotation = false;
        this.filters.tremolo = false;
        this.filters.vibrato = false;
        this.filters.karaoke = false;
        this.filters.karaoke = false;
        this.filters.volume = false;

        for (const [key, value] of Object.entries(DefaultPlayerFilters)) {
            this.data[key as keyof FilterSettings] = value;
        }

        await this.apply();
    }

    /**
     *
     * Applies the current filters to the player.
     * @returns {Promise<void>} A promise that resolves when the filters have been applied.
     */
    public async apply(): Promise<void> {
        if (!this.player.node.sessionId) return;

        this.check();

        const filters = { ...this.data };

        if (!this.filters.volume) delete filters.volume;
        if (!this.filters.tremolo) delete filters.tremolo;
        if (!this.filters.vibrato) delete filters.vibrato;

        if (!this.filters.lavalinkFilterPlugin.echo) delete filters.pluginFilters?.["lavalink-filter-plugin"]?.echo;
        if (!this.filters.lavalinkFilterPlugin.reverb) delete filters.pluginFilters?.["lavalink-filter-plugin"]?.reverb;

        if (!this.filters.lavalinkLavaDspxPlugin.echo) delete filters.pluginFilters?.echo;
        if (!this.filters.lavalinkLavaDspxPlugin.normalization) delete filters.pluginFilters?.normalization;
        if (!this.filters.lavalinkLavaDspxPlugin.highPass) delete filters.pluginFilters?.["high-pass"];
        if (!this.filters.lavalinkLavaDspxPlugin.lowPass) delete filters.pluginFilters?.["low-pass"];

        if (filters.pluginFilters?.["lavalink-filter-plugin"] && !Object.values(filters.pluginFilters["lavalink-filter-plugin"]).length)
            delete filters.pluginFilters["lavalink-filter-plugin"];
        if (filters.pluginFilters && Object.values(filters.pluginFilters).length === 0) delete filters.pluginFilters;
        if (this.filters.audioOutput === AudioOutput.Stereo) delete filters.channelMix;

        if (!this.filters.lowPass) delete filters.lowPass;
        if (!this.filters.karaoke) delete filters.karaoke;
        if (!this.filters.rotation) delete filters.rotation;

        if (this.data.timescale && Object.values(this.data.timescale).every((v) => v === 1)) delete filters.timescale;

        filters.equalizer = [...this.bands];

        if (!filters.equalizer.length) delete filters.equalizer;

        for (const key in filters) {
            if (this.player.node.info?.filters?.includes(key)) delete filters[key as keyof FilterSettings];
        }

        this.isCustomActive();

        await this.player.updatePlayer({ playerOptions: { filters } });
    }

    /**
     * Checks if the current filters are active.
     * @param {TimescaleSettings} timescale The timescale settings to check against.
     * @returns {void} Nothing!
     */
    public check(timescale?: TimescaleSettings): void {
        this.filters.rotation = this.data.rotation?.rotationHz !== 0;
        this.filters.vibrato = this.data.vibrato?.frequency !== 0 || this.data.vibrato?.depth !== 0;
        this.filters.tremolo = this.data.tremolo?.frequency !== 0 || this.data.tremolo?.depth !== 0;

        const lavalinkFilterData = this.data.pluginFilters?.["lavalink-filter-plugin"] ?? {};

        this.filters.lavalinkFilterPlugin.echo = lavalinkFilterData.echo?.decay !== 0 || lavalinkFilterData.echo?.delay !== 0;
        this.filters.lavalinkFilterPlugin.reverb =
            lavalinkFilterData.reverb?.delays?.length !== 0 || lavalinkFilterData.reverb?.gains?.length !== 0;
        this.filters.lavalinkLavaDspxPlugin.highPass = Object.values(this.data.pluginFilters?.["high-pass"] ?? {}).length > 0;
        this.filters.lavalinkLavaDspxPlugin.lowPass = Object.values(this.data.pluginFilters?.["low-pass"] ?? {}).length > 0;
        this.filters.lavalinkLavaDspxPlugin.normalization = Object.values(this.data.pluginFilters?.normalization ?? {}).length > 0;
        this.filters.lavalinkLavaDspxPlugin.echo =
            Object.values(this.data.pluginFilters?.echo ?? {}).length > 0 && typeof this.data.pluginFilters?.echo?.delay === "undefined";

        this.filters.lowPass = this.data.lowPass?.smoothing !== 0;
        this.filters.karaoke = Object.values(this.data.karaoke ?? {}).some((v) => v !== 0);

        if ((this.filters.nightcore || this.filters.vaporwave) && timescale) {
            if (
                timescale.pitch !== this.data.timescale?.pitch ||
                timescale.rate !== this.data.timescale?.rate ||
                timescale.speed !== this.data.timescale?.speed
            ) {
                this.filters.custom = Object.values(this.data.timescale ?? {}).some((v) => v !== 1);
                this.filters.nightcore = false;
                this.filters.vaporwave = false;
            }
        }
    }

    /**
     *
     * Checks if a specific filter is active.
     * @param {FilterType} filter The filter type to check.
     * @returns {boolean} True if the filter is active, false otherwise.
     */
    public has(filter: FilterType): boolean {
        const kind = this.filters[filter];

        if (typeof kind === "boolean") return kind;
        if (typeof kind === "string") return kind !== AudioOutput.Stereo;

        return false;
    }

    /**
     *
     * Sets the volume for the player.
     * @param {number} volume The volume level to set (between 0 and 5).
     * @returns {Promise<boolean>} A promise that resolves to true if the volume was changed, false otherwise.
     */
    public async setVolume(volume: number): Promise<boolean> {
        if (typeof volume !== "number" || Number.isNaN(volume) || volume < 0 || volume > 5)
            throw new PlayerError("Volume must be a number between 0 and 5.");

        this.data.volume = volume;
        this.filters.volume = volume !== 1;

        await this.apply();

        return this.filters.volume;
    }

    /**
     * Sets the audio output for the player.
     * @param {AudioOutput} output The audio output to set.
     * @returns {Promise<AudioOutput>} A promise that resolves to the set audio output.
     */
    public async setAudioOutput(output: AudioOutput): Promise<AudioOutput> {
        const outputs = Object.values(AudioOutput);
        if (!outputs.includes(output)) throw new PlayerError(`Audio output must be one of the following: ${outputs.join(", ")}.`);

        this.filters.audioOutput = output;
        this.data.channelMix = AudioOutputData[output];

        await this.apply();

        return this.filters.audioOutput;
    }

    /**
     *
     * Sets the speed for the player.
     * @param {number} speed The speed to set (default is 1).
     * @returns {Promise<boolean>} A promise that resolves to true if a custom filter is active, false otherwise.
     */
    public async setSpeed(speed: number = 1): Promise<boolean> {
        if (!this.player.node.info?.filters?.includes("timescale"))
            throw new PlayerError("Node filters does not include the 'timescale' filter. (Or the node doesn't have it enabled)");

        if (this.filters.nightcore || this.filters.vaporwave) {
            this.data.timescale!.pitch = 1;
            this.data.timescale!.speed = 1;
            this.data.timescale!.rate = 1;
            this.filters.nightcore = false;
            this.filters.vaporwave = false;
        }

        this.data.timescale!.speed = speed;

        await this.apply();

        return this.filters.custom;
    }

    /**
     *
     * Sets the rate for the player.
     * @param {number} rate The rate to set (default is 1).
     * @returns {Promise<boolean>} A promise that resolves to true if a custom filter is active, false otherwise.
     */
    public async setRate(rate: number = 1): Promise<boolean> {
        if (!this.player.node.info?.filters?.includes("timescale"))
            throw new PlayerError("Node filters does not include the 'timescale' filter. (Or the node doesn't have it enabled)");

        if (this.filters.nightcore || this.filters.vaporwave) {
            this.data.timescale!.pitch = 1;
            this.data.timescale!.speed = 1;
            this.data.timescale!.rate = 1;
            this.filters.nightcore = false;
            this.filters.vaporwave = false;
        }

        this.data.timescale!.rate = rate;

        await this.apply();

        return this.filters.custom;
    }

    /**
     *
     * Sets the pitch for the player.
     * @param {number} pitch The pitch
     * @returns {Promise<boolean>} A promise that resolves to true if a custom filter is active, false otherwise.
     */
    public async setPitch(pitch: number = 1): Promise<boolean> {
        if (!this.player.node.info?.filters?.includes("timescale"))
            throw new PlayerError("Node filters does not include the 'timescale' filter. (Or the node doesn't have it enabled)");

        if (this.filters.nightcore || this.filters.vaporwave) {
            this.data.timescale!.pitch = 1;
            this.data.timescale!.speed = 1;
            this.data.timescale!.rate = 1;
            this.filters.nightcore = false;
            this.filters.vaporwave = false;
        }

        this.data.timescale!.pitch = pitch;

        await this.apply();

        return this.filters.custom;
    }

    /**
     *
     * Sets the EQ bands for the player.
     * @param {RestOrArray<EQBandSettings>} bands The EQ band settings to set.
     * @returns {Promise<this>} A promise that resolves to the instance of the manager.
     */
    public async setEQBand(...bands: RestOrArray<EQBandSettings>): Promise<this> {
        bands = bands.flat();

        if (!bands.length || !bands.every((band) => typeof band.band === "number" && typeof band.gain === "number"))
            throw new PlayerError("Bands must be a non-empty object array containing 'band' and 'gain' properties.");

        for (const { band, gain } of bands) this.bands[band] = { band, gain };

        await this.apply();

        return this;
    }

    /**
     *
     * Clears all EQ bands for the player.
     * @returns {Promise<this>} A promise that resolves to the instance of the manager.
     */
    public async clearEQBands(): Promise<this> {
        return this.setEQBand(Array.from({ length: 15 }, (_, i) => ({ band: i, gain: 0 })));
    }

    /**
     *
     * Set the vibrato filter with the given settings.
     * @param {TremoloSettings} [settings=DefaultFilter.Vibrato] The settings for the vibrato filter.
     * @returns {Promise<boolean>} Whether the filter is now active.
     */
    public async setVibrato(settings: Partial<TremoloSettings> = DefaultFilterPreset.Vibrato): Promise<boolean> {
        if (!this.player.node.info?.filters?.includes("vibrato"))
            throw new PlayerError("Node filters does not include the 'vibrato' filter. (Or the node doesn't have it enabled)");

        this.data.vibrato!.frequency = this.filters.vibrato ? 0 : (settings.frequency ?? 10);
        this.data.vibrato!.depth = this.filters.vibrato ? 0 : (settings.depth ?? 1);
        this.filters.vibrato = !this.filters.vibrato;

        await this.apply();

        return this.filters.vibrato;
    }

    /**
     *
     * Set the tremolo filter with the given settings.
     * @param {TremoloSettings} [settings=DefaultFilter.Tremolo] The settings for the tremolo filter.
     * @returns {Promise<boolean>} Whether the filter is now active.
     */
    public async setTremolo(settings: Partial<TremoloSettings> = DefaultFilterPreset.Tremolo): Promise<boolean> {
        if (!this.player.node.info?.filters?.includes("tremolo"))
            throw new PlayerError("Node filters does not include the 'tremolo' filter. (Or the node doesn't have it enabled)");

        this.data.tremolo!.frequency = this.filters.tremolo ? 0 : (settings.frequency ?? 4);
        this.data.tremolo!.depth = this.filters.tremolo ? 0 : (settings.depth ?? 0.8);
        this.filters.tremolo = !this.filters.tremolo;

        await this.apply();

        return this.filters.tremolo;
    }

    /**
     *
     * Set the low-pass filter with the given settings.
     * @param {LowPassSettings} [settings=DefaultFilter.Lowpass] The settings for the low-pass filter.
     * @returns {Promise<boolean>} Whether the filter is now active.
     */
    public async setLowPass(settings: Partial<LowPassSettings> = DefaultFilterPreset.Lowpass): Promise<boolean> {
        if (!this.player.node.info?.filters?.includes("lowPass"))
            throw new PlayerError("Node filters does not include the 'lowPass' filter. (Or the node doesn't have it enabled)");

        this.data.lowPass!.smoothing = this.filters.lowPass ? 0 : (settings.smoothing ?? 20);
        this.filters.lowPass = !this.filters.lowPass;

        await this.apply();

        return this.filters.lowPass;
    }

    /**
     * Set the nightcore filter with the given settings.
     * @param {Partial<TimescaleSettings>} [settings=DefaultFilter.Nightcore] The settings for the nightcore filter.
     * @returns {Promise<boolean>} Whether the filter is now active.
     */
    public async setNightcore(settings: Partial<TimescaleSettings> = DefaultFilterPreset.Nightcore): Promise<boolean> {
        if (!this.player.node.info?.filters?.includes("timescale"))
            throw new PlayerError("Node filters does not include the 'timescale' filter. (Or the node doesn't have it enabled)");

        this.data.timescale!.speed = this.filters.nightcore ? 1 : settings.speed;
        this.data.timescale!.pitch = this.filters.nightcore ? 1 : settings.pitch;
        this.data.timescale!.rate = this.filters.nightcore ? 1 : settings.rate;

        this.filters.nightcore = !this.filters.nightcore;
        this.filters.vaporwave = false;
        this.filters.custom = false;

        await this.apply();

        return this.filters.nightcore;
    }

    /**
     *
     * Set the vaporwave filter with the given settings.
     * @param {Partial<TimescaleSettings>} [settings=DefaultFilter.Vaporwave] The settings for the vaporwave filter.
     * @returns {Promise<boolean>} Whether the filter is now active.
     */
    public async setVaporwave(settings: Partial<TimescaleSettings> = DefaultFilterPreset.Vaporwave): Promise<boolean> {
        if (this.player.node.info && !this.player.node.info?.filters?.includes("timescale"))
            throw new Error("Node#Info#filters does not include the 'timescale' Filter (Node has it not enable)");
        this.data.timescale!.speed = this.filters.vaporwave ? 1 : settings.speed;
        this.data.timescale!.pitch = this.filters.vaporwave ? 1 : settings.pitch;
        this.data.timescale!.rate = this.filters.vaporwave ? 1 : settings.rate;

        this.filters.vaporwave = !this.filters.vaporwave;
        this.filters.nightcore = false;
        this.filters.custom = false;

        await this.apply();

        return this.filters.vaporwave;
    }

    /**
     *
     * Set the karaoke filter with the given settings.
     * @param {KaraokeSettings} [settings=DefaultFilter.Karaoke] The settings for the karaoke filter.
     * @returns {Promise<boolean>} Whether the filter is now active.
     */
    public async setKaraoke(settings: Partial<KaraokeSettings> = DefaultFilterPreset.Karaoke): Promise<boolean> {
        if (this.player.node.info && !this.player.node.info?.filters?.includes("karaoke"))
            throw new Error("Node#Info#filters does not include the 'karaoke' Filter (Node has it not enable)");

        this.data.karaoke!.level = this.filters.karaoke ? 0 : settings.level;
        this.data.karaoke!.monoLevel = this.filters.karaoke ? 0 : settings.monoLevel;
        this.data.karaoke!.filterBand = this.filters.karaoke ? 0 : settings.filterBand;
        this.data.karaoke!.filterWidth = this.filters.karaoke ? 0 : settings.filterWidth;

        this.filters.karaoke = !this.filters.karaoke;

        await this.apply();

        return this.filters.karaoke;
    }
}
