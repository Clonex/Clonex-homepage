import { PrismaClient } from "@prisma/client";
import { Octokit } from "@octokit/rest";

if (!process.env.AUTH) {
  throw new Error("Missing Github AUTH enviroment variable");
}

export const octokit: Octokit = new Octokit({
  auth: process.env.AUTH,
  baseUrl: "https://api.github.com",
  timeZone: "Europe/Copenhagen",
});

export const database = new PrismaClient();
