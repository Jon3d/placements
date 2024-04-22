
import React, { Suspense } from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import Title from './Title';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import 'components/Components.scss';

function preventDefault(event) {
  event.preventDefault();
}

export default function LineItems({ data, pagination, setPage, setCount, sort, setSort }) {
  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const getColumnHeader = (name, key) => {
    const setSortColumn = () => {
      const newSort = {
        key,
        reverse: false,
      };
      setSort(newSort);
    }
    const setSortDirection = () => {
      const newSort = {
        key,
        reverse: !sort.reverse,
      };
      setSort(newSort);
    }
    const nameText = <span className={key === sort.key ? 'name-text-selected' : 'name-text'} onClick={setSortColumn}>{name}</span>
    const ArrowDirection = sort.reverse ? ArrowUpwardIcon : ArrowDownwardIcon;
    return (
      <span id='table-column-header'>
        {nameText}
        {key === sort.key && (
          <ArrowDirection
            onClick={setSortDirection}
            className='sort-direction-arrow'
          />
        )}
      </span>
    );
  }

  const renderData = () => {
    if (!data || data === null) return [];
    return data.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.campaign_id}</TableCell>
        <TableCell>{row.campaign_name}</TableCell>
        <TableCell>{row.line_item_name}</TableCell>
        <TableCell>{USDollar.format(row.booked_amount)}</TableCell>
        <TableCell>{USDollar.format(row.actual_amount)}</TableCell>
        <TableCell align="right" style={Math.sign(row.adjustments) === -1 ? { color: 'red' } : {}}>{USDollar.format(row.adjustments)}</TableCell>
      </TableRow>
    ));
  }

  return (
    <span id='pio-table-wrapper'>
      <Title>
        Campaigns
        <span className='download-campaign-data'>
          <CloudDownloadIcon />
        </span>
      </Title>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{getColumnHeader('ID', 'campaign_id')}</TableCell>
            <TableCell>{getColumnHeader('Name', 'campaign_name')}</TableCell>
            <TableCell>{getColumnHeader('Line Item Name', 'line_item_name')}</TableCell>
            <TableCell>{getColumnHeader('Booked Amt', 'booked_amount')}</TableCell>
            <TableCell>{getColumnHeader('Actual Amt', 'actual_amount')}</TableCell>
            <TableCell align="right">{getColumnHeader('Adjustments', 'adjustments')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <Suspense fallback={<CircularProgress />}>
            {renderData()}
          </Suspense>
        </TableBody>
      </Table>
      <Suspense fallback={<CircularProgress />}>
        <TablePagination
          component='div'
          count={pagination.total != null ? pagination.total : 1}
          page={pagination.start / pagination.size}
          rowsPerPage={pagination.size}
          onPageChange={setPage}
          onRowsPerPageChange={setCount}
        />
      </Suspense>
    </span>
  );
}
