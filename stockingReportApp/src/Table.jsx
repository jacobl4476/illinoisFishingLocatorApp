import * as React from 'react';

import {
    Table,
    Header,
    HeaderRow,
    Body,
    Row,
    HeaderCell,
    Cell,
  } from "@table-library/react-table-library/table";import { useTheme } from '@table-library/react-table-library/theme';

import { getTheme } from '@table-library/react-table-library/baseline';

export function TableT({data, setBodyOfWaterInfo, setBodyOfWater, setCenter, setZoom}) {
    const theme = useTheme([
        getTheme(), {
        Table: `
            --data-table-library_grid-template-columns: 40% max-content;
        `,
        HeaderRow: `
            .th {
              border-bottom: 1px solid #a0a8ae;
            }
          `,
        Row: `
            &:not(:last-of-type) .td {
                border-bottom: 1px solid #a0a8ae;
            }
            .td {
                text-align: left;
            }
          `,
        BaseCell: `
            &:nth-of-type(1) {
                left: 0px;
            }
            &:not(:last-of-type) {
                border-right: 1px solid #a0a8ae;

            }
          `,
        },
      ]);    

    const tableData = {nodes:data}
    return (
    <Table data={tableData} theme={theme} layout={{ custom: true }}>
      {(tableList) => (
        <>
          <Header>
            <HeaderRow>
              <HeaderCell resize pinLeft>Body of Water</HeaderCell>
              <HeaderCell resize>Species</HeaderCell>
            </HeaderRow>
          </Header>

          <Body>
            {tableList.map((item) => (
              <Row key={item.id} item={item} onClick={(item, event) => {
                setBodyOfWater(item.name)
                setBodyOfWaterInfo(item)
                setCenter(item.location.split(","))
                setZoom(10)
                }}>
                <Cell pinLeft>{item.name}</Cell>
                <Cell>{item.species.split(",").sort().join(", ")}</Cell>
              </Row>
            ))}
          </Body>
        </>
      )}
    </Table>
    )
};

export function TableY({data}) {
    const theme = useTheme([
        getTheme(), {
        Table: `
            --data-table-library_grid-template-columns: 25% 25% 25% 25%;
        `,
        HeaderRow: `
            .th {
              border-bottom: 1px solid #a0a8ae;
            }
          `,
        Row: `
            &:not(:last-of-type) .td {
                border-bottom: 1px solid #a0a8ae;
            }
            .td {
                text-align: left;
            }
          `,
        BaseCell: `
            &:nth-of-type(1) {
                left: 0px;
            }
            &:not(:last-of-type) {
                border-right: 1px solid #a0a8ae;

            }
          `,
        },
      ]);    
      //console.log(data)
    data = JSON.parse(data.stocking)
    //console.log(data)
    const years = Object.keys(data).reverse()
    const tableData = {nodes:[]}
    for(let year of years){
        for(let species of data[year])
            tableData.nodes.push(
                {
                    year,
                    ...species,
                }
            )
    }
    //console.log(tableData)
    return (
    <Table data={tableData} theme={theme} layout={{ custom: true }}>
      {(tableList) => (
        <>
          <Header>
            <HeaderRow>
              <HeaderCell resize pinLeft>Year</HeaderCell>
              <HeaderCell resize>Species</HeaderCell>
              <HeaderCell resize>Size</HeaderCell>
              <HeaderCell resize>Count</HeaderCell>
            </HeaderRow>
          </Header>

          <Body>
            {tableList.map((item) => (
              <Row key={item.id} item={item} >
                <Cell >{item.year}</Cell>
                <Cell>{item.species}</Cell>
                <Cell>{item.size}</Cell>
                <Cell>{item.count}</Cell>
              </Row>
            ))}
          </Body>
        </>
      )}
    </Table>
    )
}