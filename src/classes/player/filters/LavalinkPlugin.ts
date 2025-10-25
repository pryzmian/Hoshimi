import { FilterType, type EchoSettings, type LavalinkFilterPluginReverbSettings } from "../../../types/Filters";
import type { Omit } from "../../../types/Manager";
import { PluginNames } from "../../../types/Node";
import type { FilterManagerStructure } from "../../../types/Structures";
import { DefaultFilterPreset } from "../../../util/constants";
import { validateNodePlugins } from "../../../util/functions/utils";
import { PlayerError } from "../../Errors";

type NonLengthEchoSettings = Omit<EchoSettings, "echoLength">;

/**
 * Class representing Lavalink plugin filters.
 * @class LavalinkPluginFilter
 */
export class LavalinkPluginFilter {
    /**
     * The filter manager instance.
     * @type {FilterManagerStructure}
     * @private
     * @readonly
     */
    private readonly manager: FilterManagerStructure;

    /**
     * Creates an instance of LavalinkPluginFilter.
     * @param {FilterManagerStructure} filters - The filter manager instance.
     */
    constructor(filters: FilterManagerStructure) {
        this.manager = filters;
    }

    /**
     *
     * Set the echo filter with the given settings.
     * @param {Omit<EchoSettings, "echoLength">} [settings=DefaultFilter.PluginEcho] The settings for the echo filter.
     * @returns {Promise<boolean>} Whether the filter is now active.
     */
    public async setEcho(settings: Partial<NonLengthEchoSettings> = DefaultFilterPreset.PluginEcho): Promise<boolean> {
        validateNodePlugins(this.manager.player.node, [PluginNames.FilterPlugin]);

        if (!this.manager.player.node.info?.filters?.includes(FilterType.Echo))
            throw new PlayerError("Node filters does not include the 'echo' filter. (Or the node doesn't have it enabled)");

        if (!this.manager.data) this.manager.data = {};
        if (!this.manager.data.pluginFilters) this.manager.data.pluginFilters = {};
        if (!this.manager.data.pluginFilters["lavalink-filter-plugin"])
            this.manager.data.pluginFilters["lavalink-filter-plugin"] = { echo: { decay: 0, delay: 0 }, reverb: { delays: [], gains: [] } };
        if (!this.manager.data.pluginFilters["lavalink-filter-plugin"].echo)
            this.manager.data.pluginFilters["lavalink-filter-plugin"].echo = { decay: 0, delay: 0 };

        this.manager.data.pluginFilters["lavalink-filter-plugin"].echo.delay = this.manager.filters.lavalinkFilterPlugin.echo
            ? 0
            : settings.delay;
        this.manager.data.pluginFilters["lavalink-filter-plugin"].echo.decay = this.manager.filters.lavalinkFilterPlugin.echo
            ? 0
            : settings.decay;

        this.manager.filters.lavalinkFilterPlugin.echo = !this.manager.filters.lavalinkFilterPlugin.echo;

        await this.manager.apply();

        return this.manager.filters.lavalinkFilterPlugin.echo;
    }

    /**
     *
     * Set the reverb filter with the given settings.
     * @param {Partial<LavalinkFilterPluginReverbSettings>} [settings=DefaultFilter.PluginReverb] The settings for the reverb filter.
     * @returns {Promise<boolean>} Whether the filter is now active.
     */
    public async setReverb(settings: Partial<LavalinkFilterPluginReverbSettings> = DefaultFilterPreset.PluginReverb): Promise<boolean> {
        validateNodePlugins(this.manager.player.node, [PluginNames.FilterPlugin]);

        if (!this.manager.player.node.info?.filters?.includes(FilterType.Reverb))
            throw new PlayerError("Node filters does not include the 'reverb' filter. (Or the node doesn't have it enabled)");

        if (!this.manager.data) this.manager.data = {};
        if (!this.manager.data.pluginFilters) this.manager.data.pluginFilters = {};
        if (!this.manager.data.pluginFilters["lavalink-filter-plugin"])
            this.manager.data.pluginFilters["lavalink-filter-plugin"] = { echo: { decay: 0, delay: 0 }, reverb: { delays: [], gains: [] } };
        if (!this.manager.data.pluginFilters["lavalink-filter-plugin"].reverb)
            this.manager.data.pluginFilters["lavalink-filter-plugin"].reverb = { delays: [], gains: [] };
        this.manager.data.pluginFilters["lavalink-filter-plugin"].reverb.delays = this.manager.filters.lavalinkFilterPlugin.reverb
            ? []
            : settings.delays;
        this.manager.data.pluginFilters["lavalink-filter-plugin"].reverb.gains = this.manager.filters.lavalinkFilterPlugin.reverb
            ? []
            : settings.gains;

        this.manager.filters.lavalinkFilterPlugin.reverb = !this.manager.filters.lavalinkFilterPlugin.reverb;

        await this.manager.apply();

        return this.manager.filters.lavalinkFilterPlugin.reverb;
    }
}
