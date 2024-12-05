import { read, write, utils } from 'xlsx'
import { saveAs } from 'file-saver';

export async function readExcelFile(input){

    console.log('reading input file:');
    const file = input.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[1]];
    const jsonData = utils.sheet_to_json(worksheet);

    const jsonFinal = {}
    let columns = []
    let title = ''
    let department = ''

    for (let i = 0; i < jsonData.length; i++){
        const rowJson = jsonData[i]
        const row = []
        for (let j = 0; j < Object.keys(rowJson).length; j++){
            const index = j == 0 ? '__EMPTY' : '__EMPTY_' + j
            if (!rowJson[index]){
                row.push(undefined)
                continue
            }
            const item = rowJson[index].toString()
            if (j === 0 && item.charAt(2) == '-'){
                const letterCode = item.charAt(0)
                if (letterCode == 'T') {
                    title = item.substring(4, item.length)
                    jsonFinal[title] = {}
                    continue
                }
            }
            row.push(item)
        }
        const fC = row[0] ? row[0].toString() : ''
        const letterCode = fC ? fC.charAt(0) : null
        if (fC && fC.charAt(2) == '-') {
            if (letterCode == 'C'){
                columns = row
                continue
            } else if (letterCode == 'D'){
                department = fC.substring(4, fC.length)
                jsonFinal[title][department] = {}
                continue
            }
        }
        const rowObject = {}
        if (columns.length > 0) {
            for (let i = 0; i < row.length; i++) {
                const key = i == 0 ? columns[0].toString().substring(4, columns[0].toString().length) : columns[i].toString()
                rowObject[key] = row[i] ? row[i].toString() : ''
            }
        }
        if(title && department) {
            const key = rowObject['First Name'] ? rowObject['Last Name'] + ", " + rowObject['First Name'] : rowObject['Last Name']
            jsonFinal[title][department][key] = (rowObject)
        }
    }
    return jsonFinal
}

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function combineFiles(f1: any, f2: any, startMonth: string, endMonth: string){

    const selectedMonths = months.slice(months.indexOf(startMonth), months.indexOf(endMonth) + 1)

    console.log(selectedMonths)

    console.log(f1)
    const title1 = Object.keys(f1)[0]
    const title2 = Object.keys(f2)[0]
    const newTitle = title1 + " / " +  title2
    console.log(newTitle)
    let combinedFile = {}
    combinedFile[newTitle] = {
        ...f1[title1],
    }
    for (let dept in f2[title2]){
        if (combinedFile[newTitle][dept]){
            for (let person in f2[title2][dept]){
                if (combinedFile[newTitle][dept][person]){
                    let combinedPerson = {
                        ...f1[title1][dept][person],
                        ...f2[title2][dept][person]
                    }
                    combinedPerson['Total FY'] = parseFloat(f1[title1][dept][person]['Total FY']) + parseFloat(f2[title2][dept][person]['Total FY'])
                } else {
                    combinedFile[newTitle][dept][person] = f2[title2][dept][person]
                }
            }
        } else {
            combinedFile[newTitle][dept] = f2[title2][dept]
        }
    }
    console.log(combinedFile)
    //exportToExcel(combinedFile)
}

function exportToExcel (file: any) {
    let data = []
    let departmentTotals = []
    for(let title in file){
        for(let dept in file[title]){
            let departmentTotal = 0
            for (let person in file[title][dept]){
                departmentTotal += file[title][dept][person]['Total FY'] ? parseFloat(file[title][dept][person]['Total FY']) : 0.0
                const finalPerson = {
                    Department: dept,
                    ...file[title][dept][person],
                }
                data.push(finalPerson)
            }
            departmentTotals.push({
                Department: dept,
                'Department Total Hours': departmentTotal
            })
        }
    }
    for (let dept in departmentTotals){
        data.push(departmentTotals[dept])
    }
    console.log(data)
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Buffer to store the generated Excel file
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(blob, "data.xlsx");
};