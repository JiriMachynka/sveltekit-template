import fs from 'fs';
import path from 'path';

function deleteNodeModules() {
	const currentDir = process.cwd();
	const nodeModulesPath = path.join(currentDir, 'node_modules');

	if (fs.existsSync(nodeModulesPath)) {
		console.log('Deleting node_modules folder...');
		fs.rm(nodeModulesPath, { recursive: true, force: true }, (err) => {
			if (err) {
				console.error('Error deleting node_modules:', err);
			} else {
				console.log('node_modules folder deleted successfully.');
			}
		});
	} else {
		console.log('No node_modules folder found.');
	}
}

deleteNodeModules();
