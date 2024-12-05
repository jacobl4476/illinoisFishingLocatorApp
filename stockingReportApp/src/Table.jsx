import * as React from 'react';

import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import nodes from '../stockingReport.json';

const bodiesOfWater = Object.keys(nodes)
const data = [];

for (let bodyOfWater of bodiesOfWater){
    data.push({ name: bodyOfWater })
}

const key = 'Compact Table';

export function TableT() {
    console.log(typeof data)
    const theme = useTheme(getTheme());

    const COLUMNS = [
        { label: 'Name', renderCell: (item) => item.name }
    ];

    return <CompactTable columns={COLUMNS} data={data} theme={theme} />;
};