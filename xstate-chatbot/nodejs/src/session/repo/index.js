const config = require('../../env-variables');
const postgresRepo = require('./postgres-repo');
const inMemoryRepo = require('./in-memory-repo');

console.log(`Found repoProvider <${config.repoProvider}>`);
if(config.repoProvider === 'PostgreSQL') {
    console.log("Using PostgreSQL Repo");
    module.exports = postgresRepo;
}
else {
    console.log("Using In-memory Repo (default)");
    module.exports = inMemoryRepo;
}
