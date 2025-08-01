import cron from "node-cron";
import { crawlGithubEvents, crawlGomoreSellers } from "./crons";

cron.schedule("0 */2 * * *", () => crawlGomoreSellers());
cron.schedule("*/4 * * * *", () => crawlGithubEvents());
