import { octokit } from './connections';

interface Event {
	type: 'PushEvent';
	repo: {
		name: string;
		id: number;
	};
	payload: {
		push_id: number;
		ref: string;
		commits: {
			sha: string;
			author: {
				email: string;
			};
		}[];
	};
	created_at: string;
}

interface MappedEvent {
	sha: string;
	repo: {
		id: number;
		name: string;
	};
	id: number;
	ref: string;
	owner: string;
	time: Date;
	changes: { additions: number; deletions: number; fileName: string; extension?: string }[];
}

const USER = 'Clonex';
const EMAIL = 'clonex_kontakt@hotmail.com';

function mapEvent(event: Event) {
	if (event.type === 'PushEvent') {
		for (const commit of event.payload.commits) {
			if (commit.author.email === EMAIL) {
				const [owner, repo] = event.repo.name.split('/');
				return {
					sha: commit.sha,
					repo: {
						id: event.repo.id,
						name: repo,
					},
					id: event.payload.push_id,
					ref: event.payload.ref,
					owner,
					time: new Date(event.created_at),
					changes: [],
				};
			}
		}
	}
}

export async function getCommits(lastUpdate: Date) {
	const ret: MappedEvent[] = [];
	for await (const response of octokit.paginate.iterator('GET /users/{USER}/events', {
		USER,
	})) {
		const events = (response.data as Event[])
			.map(mapEvent)
			.filter(event => event !== undefined)
			.filter(event => event?.time && event.time > lastUpdate) as MappedEvent[];

		if (events.length === 0) {
			break;
		}

		for (const event of events) {
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
						extension: file.filename.split('.').at(-1)?.split('/').at(-1)?.toLowerCase(),
						fileName: file.filename,
					});
				}
			} catch (error) {
				// Could try to look in master instead?
				console.log('Err', error);
			}
		}

		ret.push(...events.filter(event => event.changes.length > 0));
	}

	return ret.sort((a, b) => b.time.getTime() - a.time.getTime());
}
