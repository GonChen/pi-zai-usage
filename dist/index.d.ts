/**
 * Z.ai Usage Checker - Pi Extension
 *
 * Uses createUsageExtension from the shared library to handle all
 * event registration, provider matching, caching, and footer lifecycle.
 */
import { createUsageExtension, type Theme } from "@alexanderfortin/pi-usage-lib";
import { type ZaiUsageData } from "./api";
/** Render Z.ai usage data into a themed footer string */
export declare function renderZaiStatus(data: ZaiUsageData, theme: Theme): string;
declare const extension: ReturnType<typeof createUsageExtension<ZaiUsageData>>;
export default extension;
//# sourceMappingURL=index.d.ts.map