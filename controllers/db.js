const couchbase = require('couchbase');
const cluster = new couchbase.Cluster(process.env.COUCHBASE_URL, {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD});
module.exports.bucket = cluster.bucket(process.env.BUCKET);
