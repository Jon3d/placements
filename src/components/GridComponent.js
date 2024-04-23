
import React, { Suspense, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import Title from './Title';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { COLUMNS } from 'constants';
import { DataAPI } from 'services';

import 'components/Components.scss';

const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function GridComponent({
  data,
  pagination,
  setPage,
  setCount,
  setSort,
  loading,
  exportFile,
}) {

  const api = new DataAPI();

  const getDownloadLink = () => {
    const DownloadIcon = loading ? CircularProgress : CloudDownloadIcon;
    return (
      <>
        <DownloadIcon onClick={(e) => exportFile(e, 'csv')} />
        <span className='download-links'>
          <a className='seperate-links' onClick={(e) => exportFile(e, 'csv')}>csv</a>
          &nbsp;
          <a className='seperate-links' onClick={(e) => exportFile(e, 'xlsx')}>xlsx</a>
        </span>
      </>
    )
  }

  const sortOverride = (model) => {
    if (model.length === 0) {
      model.push({ field: 'campaign_id', sort: 'desc' });
    }
    const newSort = {
      key: model[0].field,
      reverse: model[0].sort === 'asc',
    };
    setSort(newSort);
  }

  return (
    <span id='pio-table-wrapper'>
      <Title>
        Campaigns
        <span className='download-campaign-data'>
          {getDownloadLink()}
        </span>
      </Title>
      <DataGrid
        rows={data}
        columns={COLUMNS}
        sortingMode='server'
        onSortModelChange={sortOverride}
        autosizeOptions={{
          columns: COLUMNS.map(({ field }) => field),
          includeOutliers: true,
          includeHeaders: false,
          expand: true,
        }}
        processRowUpdate={(updatedRow, originalRow) => {
          api.saveById(updatedRow.id, updatedRow.adjustments.toFixed(2));
          return updatedRow;
        }}
      />
      <Suspense fallback={<CircularProgress />}>
        {pagination && <TablePagination
          component='div'
          count={pagination.total != null ? pagination.total : 1}
          page={pagination.start / pagination.size}
          rowsPerPage={pagination.size}
          onPageChange={setPage}
          onRowsPerPageChange={setCount}
        />}
      </Suspense>
    </span>
  );
}
