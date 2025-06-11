import {useEffect, useRef, useState} from 'react'
import './App.css'
import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import axios, { all } from 'axios'
import { TableT, TableY } from './Table.jsx'
import 'react-dropdown/style.css';
import * as L from "leaflet";
import "leaflet-color-markers";

const INITIAL_CENTER = [
    39.9, -89.1
]
const INITIAL_ZOOM = 6.7
const apiUrl = "http://localhost"
const defaultStockingReport = (await axios.post(`${apiUrl}/data`, 
    {
        sql: "SELECT * FROM bodiesOfWater"
    },
    { headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
    }})).data

const allYearsData = (await axios.post(`${apiUrl}/data`, 
    {
        sql: "SELECT years FROM bodiesOfWater"
    },
    { headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
    }})).data

const years = []
for(let d of allYearsData){
    for(let y of d.years.split(",")){
        if(!years.includes(y)){
            years.push(y)
        }
    }
}
years.sort().reverse()

const allSpeciesData = (await axios.post(`${apiUrl}/data`, 
    {
        sql: "SELECT species FROM bodiesOfWater"
    },
    { headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
    }})).data

const species = []
for(let d of allSpeciesData){
    for(let y of d.species.split(",")){
        if(!species.includes(y)){
            species.push(y)
        }
    }
}
species.sort()


const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

function CustomMarker({position, children, bodyOfWater, selectedBodyOfWater, setBodyOfWater, setBodyOfWaterInfo, setZoom, setCenter}) {
    return (
        <Marker icon={bodyOfWater === selectedBodyOfWater ? redIcon : greenIcon} position={position} eventHandlers={{
            click: (e) => {
                setBodyOfWater(bodyOfWater)
                setZoom(10)
                axios.post(`${apiUrl}/data`, 
                    {
                        sql: `  SELECT * FROM bodiesOfWater
                                WHERE name = "${bodyOfWater}"
                        `
                    },
                    { headers: {
                        'Content-Type': 'application/json',
                        'Accept': '*/*'
                    }}).then((res) => {
                        setBodyOfWaterInfo(res.data[0])
                        setCenter(res.data[0].location.split(","))
                    })
                },
        }}>
            {children}
        </Marker>
    )
}

function BodiesOfWaterMarkers(stockingReport, selectedBodyOfWater, setBodyOfWater, setBodyOfWaterInfo, setZoom, setCenter){
    let components = []
    for (const info of stockingReport) {
        const location = info.location.split(",")
        const bodyOfWater = info.name
        if (location.length > 0) {
            components.push(
                <CustomMarker position={location} bodyOfWater={bodyOfWater} selectedBodyOfWater={selectedBodyOfWater} setBodyOfWater={setBodyOfWater} setBodyOfWaterInfo={setBodyOfWaterInfo} setZoom={setZoom} setCenter={setCenter}>
                    <Popup>{bodyOfWater}</Popup>
                </CustomMarker>
            )
        }
    }
    return (components)
}

function Recenter({center,zoom}) {
    const map = useMap();
     useEffect(() => {
       map.setView(center, zoom);
     }, [center, zoom]);
     return null;
   }

function MyMap({stockingReport, bodyOfWater, setBodyOfWater, setBodyOfWaterInfo, zoom, center, setZoom, setCenter}) {
    return(<MapContainer center={center} zoom={zoom} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Recenter center={center} zoom={zoom} />
            {BodiesOfWaterMarkers(stockingReport, bodyOfWater, setBodyOfWater, setBodyOfWaterInfo, setZoom, setCenter).map(x => {return x})}
        </MapContainer>);}

function App() {

    const [bodyOfWater, setBodyOfWater] = useState(undefined);
    const [bodyOfWaterInfo, setBodyOfWaterInfo] = useState(undefined);
    const [tableData, setTableData] = useState(undefined)
    const [query, setQuery] = useState("SELECT * FROM bodiesOfWater")
    const [zoom, setZoom] = useState(INITIAL_ZOOM)
    const [center, setCenter] = useState(INITIAL_CENTER)
    const [yearFilter, setYearFilter] = useState(undefined)
    const [speciesFilter, setSpeciesFilter] = useState(undefined)
    const [stockingReport, setStockingReport] = useState(defaultStockingReport)

    useEffect(() => {
        if(!yearFilter && !speciesFilter){
            return
        }

        let sql = `SELECT * FROM bodiesOfWater WHERE `

        if(yearFilter && speciesFilter){
            sql += `years LIKE "%${yearFilter}%" AND species LIKE "%${speciesFilter}%"`
        } else if(yearFilter){
            sql += `years LIKE "%${yearFilter}%"`
        } else {
            sql += `species LIKE "%${speciesFilter}%"`
        }

        axios.post(`${apiUrl}/data`, 
            {
                sql
            },
            { headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*'
            }}).then((res) => {setStockingReport(res.data)})
    }, [yearFilter, speciesFilter]);

    useEffect(() => {
        axios.post(`${apiUrl}/data`, 
            {
                sql: query
            },
            { headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*'
            }}).then((res) => {
                setTableData(res.data)
            })
    }, []);

    function handleYearFilterChange(event){
        setYearFilter(event.target.value)
    }

    function handleSpeciesFilterChange(event){
        setSpeciesFilter(event.target.value)
    }

    return (
        <>
            <div style={{height:'20%'}}>
                <div style={{fontSize:18}}>
                    Year
                    <select value={yearFilter} onChange={handleYearFilterChange}>
                        <option value="">--Choose an option--</option>
                        {years.map(x => {
                           return <option value={x}>{x}</option>
                        })}
                    </select>
                    <button onClick={() => {setYearFilter(null)}}>CLEAR</button>

                    Species
                    <select value={speciesFilter} onChange={handleSpeciesFilterChange}>
                        <option value="">--Choose an option--</option>
                        {species.map(x => {
                           return <option value={x}>{x}</option>
                        })}
                    </select>
                    <button onClick={() => {setSpeciesFilter(null)}}>CLEAR</button>


                </div>
                

            </div>
            <div className="main">
                <div className="leftSide">
                    <div className="topLeftSide">
                        { tableData ? <TableT data={ tableData } setBodyOfWaterInfo={ setBodyOfWaterInfo } setBodyOfWater={ setBodyOfWater } setCenter={setCenter} setZoom={setZoom} /> : <div>Loading...</div> }
                    </div>
                    <div className="bottomLeftSide">
                        {bodyOfWater}
                        <div>
                            { bodyOfWaterInfo ? <TableY data={bodyOfWaterInfo}/> : <div>Click on a body of water above or on the map to see further details</div>}
                        </div>
                    </div>
                </div>
                <div className="rightSide">
                    <MyMap stockingReport={stockingReport} bodyOfWater={bodyOfWater} setBodyOfWater={setBodyOfWater} setBodyOfWaterInfo={setBodyOfWaterInfo} center={center} zoom={zoom} setCenter={setCenter} setZoom={setZoom}/>
                </div>
            </div>
        </>

    )
}

export default App
