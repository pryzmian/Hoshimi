import {
    AudioOutput,
    type TimescaleSettings,
    type EnabledPlayerFilters,
    type EQBandSettings,
    type FilterSettings,
} from "../../types/Filters";
import type { PlayerStructure } from "../../types/Structures";
import { AudioOutputData } from "../../util/constants";
import { PlayerError } from "../Errors";

/**
 * The default filter settings.
 * @constant {FilterSettings} DefaultFilters
 */
const DefaultFilters: FilterSettings = {
    volume: 1,
    channelMix: AudioOutputData.stereo,
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
    },
};

/**
 * Class representing a filter manager for a player.
 * @class FilterManager
 */
export class FilterManager {
    /**
     * The player this filter manager belongs to.
     * @type {PlayerStructure}
     * @private
     * @readonly
     */
    private readonly player: PlayerStructure;

    /**
     * The bands applied to the player.
     * @type {EQBandSettings[]}
     * @readonly
     */
    public readonly bands: EQBandSettings[] = [];

    /**
     * The current filter settings applied to the player.
     * @type {FilterSettings}
     * @readonly
     */
    public readonly data: FilterSettings = DefaultFilters;

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
     *
     * Creates a new filter manager.
     * @param {PlayerStructure} player The player this filter manager belongs to.
     */
    constructor(player: PlayerStructure) {
        this.player = player;
    }

    /**
     *
     * Checks if a custom filter is active.
     * @returns {boolean} True if a custom filter is active, false otherwise.
     */
    public isCustomFilterActive(): boolean {
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

        for (const [key, value] of Object.entries(DefaultFilters)) {
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

        await this.check();

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

        await this.player.updatePlayer({ playerOptions: { filters } });
    }

    /**
     * Checks if the current filters are active.
     * @param {TimescaleSettings} timescale The timescale settings to check against.
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
    public async setSpeed(speed = 1): Promise<boolean> {
        if (!this.player.node.info?.filters?.includes("timescale"))
            throw new PlayerError("Node#Info#filters does not include the 'timescale' Filter (Node has it not enable)");

        if (this.filters.nightcore || this.filters.vaporwave) {
            if (this.data.timescale) {
                this.data.timescale.pitch = 1;
                this.data.timescale.speed = 1;
                this.data.timescale.rate = 1;
            }

            this.filters.nightcore = false;
            this.filters.vaporwave = false;
        }

        if (this.data.timescale) this.data.timescale.speed = speed;

        this.isCustomFilterActive();

        await this.apply();

        return this.filters.custom;
    }

    /**
     *
     * Sets the rate for the player.
     * @param {number} rate The rate to set (default is 1).
     * @returns {Promise<boolean>} A promise that resolves to true if a custom filter is active, false otherwise.
     */
    public async setRate(rate = 1): Promise<boolean> {
        if (!this.player.node.info?.filters?.includes("timescale"))
            throw new PlayerError("Node#Info#filters does not include the 'timescale' Filter (Node has it not enable)");

        if (this.filters.nightcore || this.filters.vaporwave) {
            if (this.data.timescale) {
                this.data.timescale.pitch = 1;
                this.data.timescale.speed = 1;
                this.data.timescale.rate = 1;
            }

            this.filters.nightcore = false;
            this.filters.vaporwave = false;
        }

        if (this.data.timescale) this.data.timescale.rate = rate;

        this.isCustomFilterActive();

        await this.apply();

        return this.filters.custom;
    }
}
