import React, { useEffect, useState, useMemo } from 'react';
import { Chart, Copyright, GridComponent } from 'components';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { DataAPI } from 'services';

const Campaigns = () => {
  const [data, setData] = useState([]);
  const [aggsData, setAggsData] = useState([]);
  const [start, setStart] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState({ key: 'campaign_id', reverse: false });
  const [loading, setLoading] = useState(false);
  const [chartCount, setChartCount] = useState(0);
  const api = new DataAPI();

  const setChartPage = async (e, newPage) => {
    e.preventDefault();
    const aggs = await api.getAggregations({ reverse: true, start: 10 * newPage });
    setAggsData(aggs.data)
  }

  const setPage = (e, newPage) => {
    e.preventDefault();
    setStart(newPage * size);
  };

  const setDataSize = (e) => {
    e.preventDefault();
    const count = parseInt(e.target.value, 10);
    setSize(count);
    setStart(0);
  }

  const exportFile = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    await api.exportFile(type);
    setLoading(false);
  }

  useEffect(() => {
    const status = { mounted: true };
    setLoading(true);
    (async () => {
      // Can run twice on initial load in development mode, this shouldn't happen in a prod env
      const params = {
        size,
        start,
        sort: sort.key,
        ...(sort.reverse && { reverse: true }) //Include reverse key only if reversed
      }
      const r = await api.getData(params);
      const aggs = await api.getAggregations({ reverse: true });
      setAggsData(aggs.data)
      setChartCount(Math.ceil(aggs.total / aggs.size))
      setData(r.data);
      setStart(r.start);
      setSize(r.size);
      setTotal(r.total);
      setLoading(false);
    })();
    return () => {
      status.mounted = false;
    };
  }, [start, size, sort]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 300,
            }}
          >
            <Chart data={aggsData} count={chartCount} setPage={setChartPage} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <GridComponent
              data={data}
              pagination={{ start, size, total }}
              setPage={setPage}
              setCount={setDataSize}
              sort={sort}
              setSort={setSort}
              loading={loading}
              exportFile={exportFile}
            />
          </Paper>
        </Grid>
      </Grid>
      <Copyright sx={{ pt: 4 }} />
    </Container>
  );
}

export default Campaigns;