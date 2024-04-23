import React, { useEffect, useState, Suspense } from 'react';
import { useTheme } from '@mui/material/styles';
import { BarChart, axisClasses } from '@mui/x-charts';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';

import Title from './Title';

export default function Chart({ data = [], count, setPage }) {
  const theme = useTheme();

  const format = (row, data) => {
    data[0].data.push(row.booked_amount.toFixed(2));
    data[1].data.push(row.actual_amount.toFixed(2));
    data[2].data.push(row.adjustments.toFixed(2));
  }

  const fdata = data.reduce((aggs, row) => {
    aggs.labels.push(`Campaign ${row.campaign_id}`);
    format(row, aggs.data);
    return aggs;
  }, { labels: [], data: [{ data: [], label: 'Booked Amt' }, { data: [], label: 'Actual Amt' }, { data: [], label: 'Adjustments' }] });

  const getBarChart = () => {
    if (!data || data.length === 0) return <span className='chart-placeholder'><CircularProgress /></span>;
    return (
      <BarChart
        series={fdata.data}
        margin={{
          top: 30,
          right: 20,
          left: 90,
          bottom: 30,
        }}
        xAxis={[{
          scaleType: 'band',
          data: fdata.labels,
        }]}
        sx={{
          [`.${axisClasses.root} line`]: { stroke: theme.palette.text.secondary },
          [`.${axisClasses.root} text`]: { fill: theme.palette.text.secondary },
          [`& .${axisClasses.left} .${axisClasses.label}`]: {
            transform: 'translateX(-25px)',
          },
        }}
      />
    );
  }

  return (
    <React.Fragment>
      <Title>Amounts</Title>
      <div id='campaign-bar-chart-wrapper' style={{ width: '100%', flexGrow: 1, overflow: 'hidden' }}>
        {getBarChart()}
      </div>
      <span className='chart-paginator'>
        <Pagination count={count} onChange={setPage} />
      </span>
    </React.Fragment>
  );
}