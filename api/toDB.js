const sqlite3 = require('sqlite3');
const fs = require('fs');

const stockingData = require("../stockingReport.json")
const fileLocation = "./stocking.db"

async function main(){
  fs.truncate(fileLocation, 0, function(){
    console.log("cleared")

    const db = new sqlite3.Database(fileLocation);

    db.serialize(() => {
        db.run(
          "CREATE TABLE bodiesOfWater (name TEXT PRIMARY KEY, stocking TEXT, species TEXT, location TEXT, years TEXT)"
        )
        console.log("Table created successfully!")
        
        const stmt = db.prepare("INSERT INTO bodiesOfWater (name, stocking, species, location, years) VALUES (?, ?, ?, ?, ?)")
        for(let bodyOfWaterName of Object.keys(stockingData)){
            const dataPoint = stockingData[bodyOfWaterName]
            const name = bodyOfWaterName
            const stocking = JSON.stringify(dataPoint.stocking)
            const speciesDupes = Object.keys(dataPoint.stocking).map(x => dataPoint.stocking[x][0].species)
            const species = [...new Set(speciesDupes)].join(",")
            const location = dataPoint.location.join(",")
            const yearsDupes = Object.keys(dataPoint.stocking)
            const years = [...new Set(yearsDupes)].join(",")
            stmt.run(name, stocking, species, location, years)
        }
        stmt.finalize()

        // db.all("SELECT * FROM bodiesOfWater", (err, rows) => {
        //   if (err) {
        //     console.error("Error querying data:", err)
        //     return
        //   }

        //   console.log("Query results:", rows)
        // })
        // Close the database when done
        db.close()
      })
    })
  }

  main()