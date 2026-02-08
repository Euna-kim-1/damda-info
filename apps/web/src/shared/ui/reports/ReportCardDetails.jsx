import { Stack, Typography } from '@mui/material';
import { formatPrice } from '../../utils/formatters';

const ReportCardDetails = ({ report }) => {
  return (
    <Stack spacing={0.4} sx={{ minWidth: 0 }}>
      <Typography sx={{ fontWeight: 800 }} noWrap>
        {report.productName}
      </Typography>

      <Typography sx={{ color: 'text.secondary', fontSize: 13 }} noWrap>
        {report.brand ? `Brand: ${report.brand}` : 'Brand: -'}
      </Typography>

      <Typography sx={{ color: 'text.secondary', fontSize: 13 }} noWrap>
        {report.storeName ? `Store: ${report.storeName}` : 'Store: -'}
      </Typography>

      <Typography sx={{ fontWeight: 900, mt: 0.5 }}>
        {formatPrice(report.price)}
      </Typography>
    </Stack>
  );
};

export default ReportCardDetails;
