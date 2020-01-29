# CENTLY-Boilerplate
CENTLy Couchbase Express Node Tested Login. A boilerplate application for building RESTful APIs in Node.js using couchbase, express and Osom.

Preparation
create your own .config folder to store ENV files, I have set this up to take dev.env and test.env repectively.
ENV variables needed for this project are:
PORT            ( port for dev/testing server )
ADDRESS         ( your machine ip or put localhost )
COUCHBASE_URL   ( address to your couchbase test db server )
DB_USERNAME     ( Couchbase account with permission to you DB )
DB_PASSWORD     ( Couchbase account password )
BUCKET          ( this should be different buckets based on dev or test scenario )
JWT_SECRET      ( this can be any secret, just don't tell anyone )
NODE_ENV        ( set to dev or test respectively )