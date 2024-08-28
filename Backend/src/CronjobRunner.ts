import cron from "node-cron";
import { crawlGithubEvents, crawlURLCron } from "./crons";

cron.schedule("*/2 * * * *", () => crawlGithubEvents());
cron.schedule("* * * * *", () => {
  if (process.env.CRAWL_URL) {
    crawlURLCron();
  }
});
