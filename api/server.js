const fastify = require('fastify')({ logger: true })
const cors = require('@fastify/cors')
const middie = require('@fastify/middie');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const { exec } = require('child_process');

const fileLocation = "./stocking.db"
const db = new sqlite3.Database(fileLocation);

const originRoute = "http://localhost"

// Declare a route
fastify.options('/data', function handler (request, reply) {
  reply.header("Access-Control-Allow-Origin", originRoute);
  reply.header("Access-Control-Allow-Credentials", "true");
  reply.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  reply.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  reply.send("handled")
})

fastify.post('/data', async function handler (request, reply) {
  reply.header("Access-Control-Allow-Origin", originRoute);
  reply.header("Access-Control-Allow-Credentials", "true");
  reply.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  reply.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  console.log(request.body.sql)
  reply.send( await main(request.body.sql) )
})

fastify.get('/test', function handler (request, reply) {
  reply.header("Access-Control-Allow-Origin", originRoute);
  reply.send( "hello world" )
})

// Run the server!
fastify.listen({  host: '0.0.0.0', port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

async function main(sql){
  const data = await fetchAll(db, sql);
  return data 
}

const fetchAll = async (db, sql, params) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};