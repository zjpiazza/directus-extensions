import { Octokit } from "@octokit/rest";
import { stringify } from "yaml";
import { Buffer } from "node:buffer";

type Output = { path: string; data: unknown }; // path relative to repo root

export async function getFileContent(params: {
	token: string;
	owner: string;
	repo: string;
	path:string;
	ref?: string;
}): Promise<string | null> {
	const { token, owner, repo, path, ref } = params;
	const octokit = new Octokit({ auth: token });

	try {
		const response = await octokit.repos.getContent({
			owner,
			repo,
			path,
			ref,
		});

		if (Array.isArray(response.data) || !('content' in response.data)) {
			return null;
		}

		return Buffer.from(response.data.content, 'base64').toString('utf-8');
	} catch (error: any) {
		if (error.status === 404) {
			return null; // File not found
		}
		throw error;
	}
}


export async function upsertFiles(params: {
  token: string;
  owner: string;
  repo: string;
  branch: string; // e.g., "main"
  commitMessage: string;
  outputs: Output[];
}): Promise<string> {
  const { token, owner, repo, branch, outputs, commitMessage } =
    params;
  const octokit = new Octokit({ auth: token });

  const { data: refData } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
  const headSha = refData.object.sha;

  // Create blobs for each file and build a new tree
  const blobs = await Promise.all(
    outputs.map(async ({ path: filePath, data }) => {
      const content = stringify(data);
      const blob = await octokit.git.createBlob({
        owner,
        repo,
        content,
        encoding: "utf-8",
      });
      return { filePath, content, blobSha: blob.data.sha };
    })
  );

  const tree = await octokit.git.createTree({
    owner,
    repo,
    base_tree: headSha,
    tree: blobs.map((b) => ({
      path: b.filePath,
      mode: "100644",
      type: "blob",
      sha: b.blobSha,
    })),
  });

  // Create a commit and update the ref
  const commit = await octokit.git.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: tree.data.sha,
    parents: [headSha],
  });

  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: commit.data.sha,
    force: false,
  });

  return commit.data.sha;
}