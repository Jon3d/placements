import Box from "@mui/material/Box";

const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const getColor = (val) => {
  return Math.sign(val) === -1 ? 'red' : 'black';
}

export const COLUMNS = [
  {
    field: 'campaign_id',
    headerName: 'ID',
    type: 'number',
    editable: false,
    align: 'center',
    headerAlign: 'center',
    flex: 1,
  },
  {
    field: 'campaign_name',
    headerName: 'Name',
    type: 'string',
    editable: false,
    align: 'center',
    headerAlign: 'center',
    flex: 1,
  },
  {
    field: 'line_item_name',
    headerName: 'Line Item Name',
    type: 'number',
    editable: false,
    align: 'center',
    headerAlign: 'center',
    flex: 1,
  },
  {
    field: 'booked_amount',
    headerName: 'Booked Amt',
    type: 'number',
    editable: false,
    align: 'right',
    headerAlign: 'right',
    flex: 1,
    valueFormatter: (value) => {
      if (value == null) {
        return '';
      }
      return USDollar.format(value);
    },
  },
  {
    field: 'actual_amount',
    headerName: 'Actual Amt',
    type: 'number',
    editable: false,
    align: 'right',
    headerAlign: 'right',
    flex: 1,
    valueFormatter: (value) => {
      if (value == null) {
        return '';
      }
      return USDollar.format(value || 0);
    },
  },
  {
    field: 'adjustments',
    headerName: 'Adjustments',
    type: 'number',
    editable: true,
    align: 'right',
    headerAlign: 'right',
    flex: 1,
    valueGetter: (val) => val.toFixed(2),
    renderCell: (params) => {
      const color = getColor(params.value);
      return (
        <Box
          sx={{
            color,
            width: "100%",
            height: "100%"
          }}
        >
          {USDollar.format(params.value)}
        </Box>
      );
    },
  },
];
