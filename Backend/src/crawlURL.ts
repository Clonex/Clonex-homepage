import { database } from "./connections";

const URL = process.env.CRAWL_URL;
const htmlKey = atob(process.env.HTML_KEY || "");

async function getValue() {
  if (!URL) {
    throw new Error("Missing CRAWL_URL");
  }

  const request = await fetch(URL);
  const content = await request.text();

  const value = content.split(htmlKey)[1]?.split(" ")[0];
  if (!value) {
    throw new Error("Couldnt find value!");
  }

  return value;
}

async function crawl() {
  if (!URL) {
    throw new Error("Missing CRAWL_URL");
  }

  if (!process.env.HTML_KEY) {
    throw new Error("Missing HTML_KEY");
  }

  const value = await getValue();

  await database.crawlLog.create({
    data: {
      type: URL,
      value,
    },
  });

  console.log("Crawled value", value);
}

crawl();
