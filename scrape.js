const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")
const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'google',
    httpAdapter: 'https', // Default
    apiKey: '', // Leave empty for Nominatim
    formatter: null         // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);


async function main() {
    const axiosResponseMain = await axios.request({
        method: "GET",
        url: "https://www.ifishillinois.org/programs/stocking_selector.php",
    })
    let $ = cheerio.load(axiosResponseMain.data)
    //const $ = cheerio.load(myHtml)
    const bodiesOfWaterLinks = []
    $(".listCol").children('ul').children('li').children('a').each( (i, e) => {
        bodiesOfWaterLinks.push($(e).attr('href'))
    })
    const allObject = {}
    for(let waterIndex = 0; waterIndex < bodiesOfWaterLinks.length; waterIndex++) {
        const axiosResponseBodyOfWater = await axios.request({
            method: "GET",
            url: `https://www.ifishillinois.org/${bodiesOfWaterLinks[waterIndex]}`,
        })
        $ = cheerio.load(axiosResponseBodyOfWater.data)
        const table = $("table").text()
        const parsed = table.split("\n").map(x => x.trim())
        const bodyOfWaterName = $("h2").text().split(" for ")[1].trim()
        const bodyOfWaterObj = { stocking: {}}
        for (let i = 8; i < parsed.length - 26; i += 4) {
            const row = {
                species: parsed[i + 1],
                size: parsed[i + 2],
                count: parsed[i + 3],
            }
            if(bodyOfWaterObj.stocking[parsed[i]]){
                bodyOfWaterObj.stocking[parsed[i]].push(row)
            } else {
                bodyOfWaterObj.stocking[parsed[i]] = [row]
            }
        }
        bodyOfWaterObj.location = await getGeolocation(bodyOfWaterName + ", IL")
        allObject[bodyOfWaterName] = bodyOfWaterObj
    }
    fs.writeFile('./stockingReportApp/stockingReport.json', JSON.stringify(allObject, null, 4), 'utf8', function (err) {
        if (err) {
            console.log('Could not write file: ' + err)
        } else {
            console.log('Success')
        }
    })
}

async function doThis(){
    //getGeolocation("BARREN CREEK, IL")
}
async function getGeolocation(address) {
    const resp = await geocoder.geocode(address)
    if(resp.length > 0) {
        const coords = [
            resp[0].latitude, resp[0].longitude
        ]
        //console.log(address, coords)
        return coords
    }
    return []

}
//doThis()

main()
