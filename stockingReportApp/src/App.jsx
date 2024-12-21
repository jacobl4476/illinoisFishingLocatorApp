import {useEffect, useRef, useState} from 'react'
import './App.css'
import stockingReport from "../stockingReport.json";
import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import { TableT } from './Table.jsx'

const INITIAL_CENTER = [
    39.9, -89.1
]
const INITIAL_ZOOM = 6.7
const bodiesOfWater = Object.keys(stockingReport)

function CustomMarker({position, children, bodyOfWater, setBodyOfWater}) {
    return (
        <Marker position={position} eventHandlers={{
            click: (e) => {
                setBodyOfWater(bodyOfWater)
                console.log(bodyOfWater)
            },
        }}>
            {children}
        </Marker>
    )
}

function BodiesOfWaterMarkers(setBodyOfWater){
    let components = []
    for (const bodyOfWater of bodiesOfWater) {
        const info = stockingReport[bodyOfWater]
        const location = info.location

        if (location.length > 0) {
            components.push(
                <CustomMarker position={location} bodyOfWater={bodyOfWater} setBodyOfWater={setBodyOfWater}>
                    <Popup>{bodyOfWater}</Popup>
                </CustomMarker>
            )
        }
    }
    return (components)
}

function Map({setBodyOfWater}) {
    return (
        <MapContainer center={INITIAL_CENTER} zoom={INITIAL_ZOOM} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {BodiesOfWaterMarkers(setBodyOfWater).map(x => {return x})}
        </MapContainer>
    );
}

function Table(bodyOfWater){
    const info = stockingReport[bodyOfWater]
    let stockingInfoComponents = []
    const years = Object.keys(info.stocking).reverse()
    for(let year of years){
        for(let speciesInfo of info.stocking[year]) {
            stockingInfoComponents.push((<div className="row">{year} {"\t\t"} {speciesInfo.species} {"\t"} {speciesInfo.size} {"\t"} {speciesInfo.count} </div>))
        }
    }

    return ( <div>
        <div>{bodyOfWater}</div>
            <div>{stockingInfoComponents.map(x => {return x})}</div>
        </div>
    )
}

function App() {
    const [inputValue, setInputValue] = useState('');
    const [bodyOfWater, setBodyOfWater] = useState("BARREN CREEK");

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            setBodyOfWater(inputValue)
        }
    };

    return (
        <>
            <div style={{height:'20%'}}>
                <div>
                    Stocking Report App
                </div>
                <div className="card">
                    <input name="myInput"
                           value={inputValue}
                           onChange={handleInputChange}
                           onKeyPress={handleKeyPress}
                    />
                </div>
            </div>
            <div className="main">
                <TableT/>
            <Map setBodyOfWater={setBodyOfWater}/>
            </div>
        </>

    )
}

export default App
