import { database } from './connections';
import { getCommits } from './utils';

async function crawlGithubEvents() {
	console.log('Crawling');
	const lastCommit = await database.commit.findFirst({
		select: {
			createdAt: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});
	const dates = new Date(lastCommit?.createdAt ?? '2024-05-10T10:28:34.000Z');
	const commits = await getCommits(dates);

	for (const commit of commits) {
		const check = await database.commit.findFirst({
			where: {
				pushId: commit.id,
			},
		});
		if (!check) {
			await database.commit.create({
				data: {
					pushId: commit.id,
					ref: commit.ref,
					sha: commit.sha,
					changes: {
						create: commit.changes,
					},
				},
			});
		}
	}
	console.log('Commits', commits.length);
}

crawlGithubEvents();
