import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import Link from '@mui/material/Link';
import { useParams } from 'react-router-dom';
import { DataAPI } from 'services';
import CircularProgress from '@mui/material/CircularProgress';
import InputLabel from '@mui/material/InputLabel';
import { USDollar } from 'constants';
import Search from '@mui/icons-material/Search';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useNavigate } from "react-router-dom";


const Details = (props) => {
  const [detailData, setDetailData] = useState();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const api = new DataAPI();
  const navigate = useNavigate();
  const detailKeys = ['id', 'campaign_id', 'campaign_name', 'line_item_name', 'booked_amount', 'actual_amount', 'adjustments'];

  const getTitle = (key) => {
    const words = key.split('_');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  useEffect(() => {
    const status = { mounted: true };
    (async () => {
      if (id) {
        setLoading(true);
        const data = await api.getLineItemById(id);
        setDetailData(data);
        setResults([]);
        setLoading(false);
      }
    })();
    return () => {
      status.mounted = false;
    };
  }, [id]);

  const searchDetails = async ({ target: { value } }) => {
    if (value) {
      const results = await api.query(value);
      setResults(results);
    } else {
      setResults([]);
    }
  }

  const getDetailContent = () => {
    if (!id) {
      let table = <></>;
      if (results && results.length > 0) {
        table = (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">ID</TableCell>
                  <TableCell align="center">Campaign Name</TableCell>
                  <TableCell align="center">Line Item ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="center"><Link href={`/details/${row.id}`}>{row.id}</Link></TableCell>
                    <TableCell align="center"><Link href={`/details/${row.id}`}>{row.campaign_name}</Link></TableCell>
                    <TableCell align="center"><Link href={`/details/${row.id}`}>{row.line_item_name}</Link></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
      return (
        <>
          <Input
            aria-label="input"
            placeholder=" Line Item Search…"
            onChange={searchDetails}
            startAdornment={<Search />}
            fullWidth
          />
          {table}
        </>
      );
    }
    if (!detailData && (!results || results.length === 0)) {
      return <CircularProgress />;
    }


    const details = detailKeys.map((key) => {
      return (
        <div key={key}>
          <InputLabel>{getTitle(key)}</InputLabel>
          <TextField
            disabled={true}
            style={{ width: "100%", margin: "5px" }}
            type="text"
            variant="outlined"
            defaultValue={key.includes('amount') || key === 'adjustments' ? USDollar.format(detailData[key]) : detailData[key]}
          />
        </div>
      )
    });
    return (
      <>
        <h2>Line Item Name: {detailData.line_item_name}</h2>
        {details}
      </>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {getDetailContent()}
    </Container>
  );
}

export default Details;