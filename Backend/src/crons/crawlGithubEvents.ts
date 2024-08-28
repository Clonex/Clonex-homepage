import { database } from "../connections";
import { MappedEvent, getActivity, getStartingPoint } from "./utils";

async function updateCommit(event: Extract<MappedEvent, { type: "commit" }>) {
  const check = await database.commit.findFirst({
    select: {
      id: true,
    },
    where: {
      pushId: event.id,
    },
  });
  if (!check) {
    await database.commit.create({
      data: {
        pushId: event.id,
        ref: event.ref,
        sha: event.sha,
        changes: {
          create: event.changes,
        },
        repository: {
          connectOrCreate: {
            create: {
              id: event.repo.id,
              name: event.repo.name,
            },
            where: {
              id: event.repo.id,
            },
          },
        },
      },
    });
  }
}

async function updateReviewComment(
  event: Extract<MappedEvent, { type: "reviewComment" }>
) {
  const check = await database.reviewComment.findFirst({
    select: {
      id: true,
    },
    where: {
      commentId: event.id,
    },
  });
  if (!check) {
    await database.reviewComment.create({
      data: {
        commentId: event.id,
        fileName: event.file.fileName,
        extension: event.file.extension,
        comment: event.comment,
        repository: {
          connectOrCreate: {
            create: {
              id: event.repo.id,
              name: event.repo.name,
            },
            where: {
              id: event.repo.id,
            },
          },
        },
        review: {
          connectOrCreate: {
            create: {
              id: event.review.id,
              ref: event.review.ref,
              title: event.review.title,
            },
            where: { id: event.review.id },
          },
        },
      },
    });
  }
}

export async function crawlGithubEvents() {
  const lastDate = await getStartingPoint();
  const activities = await getActivity(lastDate);

  for (const activity of activities) {
    if (activity.type === "reviewComment") {
      await updateReviewComment(activity);
    } else if (activity.type === "commit") {
      await updateCommit(activity);
    }
  }
  console.log("Activities", { amount: activities.length, lastDate });
}
