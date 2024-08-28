import { database, octokit } from "../connections";

type PullRequestCommentPayload = {
  type: "PullRequestReviewCommentEvent";
  payload: {
    pull_request: {
      id: number;
      title: string;
      head: {
        ref: string;
      };
    };
    comment: {
      id: number;
      path: string;
      commit_id: string;
      pull_request_review_id: number;
      body: string;
    };
  };
};

type CommmitEvent = {
  type: "PushEvent";
  payload: {
    commits: {
      sha: string;
      author: {
        email: string;
      };
    }[];
  };
};

type Event = {
  repo: {
    name: string;
    id: number;
  };
  payload: {
    push_id: number;
    ref: string;
  };
  created_at: string;
} & (CommmitEvent | PullRequestCommentPayload);

interface MappedPushEvent {
  sha: string;
  repo: {
    id: number;
    name: string;
  };
  id: number;
  ref: string;
  owner: string;
  time: Date;
  type: "commit";
  changes: {
    additions: number;
    deletions: number;
    fileName: string;
    extension?: string;
  }[];
}

export type MappedEvent = NonNullable<ReturnType<typeof mapEvent>>;

const USER = "Clonex";
const EMAIL = "clonex_kontakt@hotmail.com";

function mapEvent(event: Event) {
  if (event.type === "PushEvent") {
    for (const commit of event.payload.commits) {
      if (commit.author.email === EMAIL) {
        const [owner, repo] = event.repo.name.split("/");
        return {
          sha: commit.sha,
          repo: {
            id: event.repo.id,
            name: repo || "unknown",
          },
          id: event.payload.push_id,
          ref: event.payload.ref,
          owner: owner || "unknown",
          type: "commit",
          time: new Date(event.created_at),
          changes: [],
        } as MappedPushEvent;
      }
    }
  } else if (event.type === "PullRequestReviewCommentEvent") {
    const reviewComment = event.payload.comment;
    const pullRequest = event.payload.pull_request;
    const [owner, repo] = event.repo.name.split("/");

    return {
      repo: {
        id: event.repo.id,
        name: repo || "unknown",
      },
      review: {
        id: reviewComment.pull_request_review_id,
        ref: pullRequest.head.ref,
        title: pullRequest.title,
      },
      comment: reviewComment.body,
      id: reviewComment.id,
      owner: owner || "unknown",
      type: "reviewComment",
      time: new Date(event.created_at),
      file: {
        extension: reviewComment.path
          .split(".")
          .at(-1)
          ?.split("/")
          .at(-1)
          ?.toLowerCase(),
        fileName: reviewComment.path,
      },
    } as const;
  }
}

export async function getActivity(lastUpdate: Date) {
  const ret: MappedEvent[] = [];

  for await (const response of octokit.paginate.iterator(
    "GET /users/{USER}/events",
    {
      USER,
    }
  )) {
    const events = (response.data as Event[])
      .map(mapEvent)
      .filter((event): event is MappedEvent => event !== undefined)
      .filter((event) => event?.time && event.time > lastUpdate);

    if (events.length === 0) {
      break;
    }

    for (const event of events) {
      if (event.type === "commit") {
        try {
          const commit = await octokit.rest.repos.getCommit({
            owner: event.owner,
            repo: event.repo.name,
            ref: event.ref,
          });
          for (const file of commit.data.files ?? []) {
            event.changes.push({
              additions: file.additions,
              deletions: file.deletions,
              extension: file.filename
                .split(".")
                .at(-1)
                ?.split("/")
                .at(-1)
                ?.toLowerCase(),
              fileName: file.filename,
            });
          }
        } catch (error) {
          // Could try to look in master instead?
          console.log("Err", error);
        }

        if (event.changes.length === 0) {
          continue;
        }
      }

      ret.push(event);
    }
  }

  return ret.sort((a, b) => b.time.getTime() - a.time.getTime());
}

export async function getStartingPoint() {
  const [lastCommit, lastReviewComment] = await Promise.all([
    database.commit.findFirst({
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    database.reviewComment.findFirst({
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const lastCommitDate = new Date(
    lastCommit?.createdAt ?? "2024-05-10T10:28:34.000Z"
  );
  const lastReviewCommentDate = new Date(
    lastReviewComment?.createdAt ?? "2024-05-10T10:28:34.000Z"
  );

  return lastCommitDate > lastReviewCommentDate
    ? lastReviewCommentDate
    : lastCommitDate;
}
