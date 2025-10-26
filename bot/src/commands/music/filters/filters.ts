import { AutoLoad, Command, Declare } from "seyfert";

@Declare({
    name: "filters",
    description: "Manage music filters.",
    aliases: ["f", "filter"],
})
@AutoLoad()
export default class FiltersCommand extends Command {}
