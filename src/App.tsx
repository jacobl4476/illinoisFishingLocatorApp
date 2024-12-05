import Dropdown from './components/dropdown.tsx'
import {readExcelFile, combineFiles, months} from "./backend";
import {useState} from "react";


export default function App() {

    const [file1, setFile1] = useState({});
    const [file2, setFile2] = useState({});
    const [startMonth, setStartMonth] = useState('Jan');
    const [endMonth, setEndMonth] = useState('Dec');


    return (
        <div className="p-10 flex justify-between">
            <div>
                <div className='p-2'>
                    <button className='p-2 border-2 rounded border-sky-500 bg-sky-100' onClick={() => {combineFiles(file1, file2, startMonth, endMonth)}}> COMPUTE </button>
                </div>
                <input className='p-2'
                    type="file"
                    onInput={async e => setFile1(await readExcelFile(e))}
                />
                <input className='p-2'
                       type="file"
                       onInput={async e => setFile2(await readExcelFile(e))}
                />
                <div className='p-2 ps-20'>
                    <Dropdown onSelect={setStartMonth} display={'Start Month'} items={months}/>
                </div>
                <div className='p-2 ps-20'>
                    <Dropdown onSelect={setEndMonth} display={'End Month'} items={months}/>
                </div>
            </div>

        </div>
    )
}