import { Card, CardContent, CardMedia, Stack, Typography } from '@mui/material';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ReportCard({
  title,
  storeName,
  price,
  imageUrl,
  reportedAt,
}) {
  const fallbackImage = '/2.png';

  return (
    <Card
      sx={{
        display: 'flex',
        borderRadius: 999,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        height: 140,
      }}
    >
      <CardMedia
        component="img"
        image={imageUrl || fallbackImage}
        alt={title || 'Report'}
        sx={{
          flex: '0 0 50%',
          width: '50%',
          height: '100%',
          objectFit: 'contain',
        }}
        onError={(e) => {
          e.currentTarget.src = fallbackImage;
        }}
      />

      <CardContent sx={{ flex: '1 1 50%', minWidth: 0, py: 1.5 }}>
        <Stack spacing={0.4} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800 }} noWrap>
            {title || '-'}
          </Typography>

          <Typography sx={{ color: 'text.secondary', fontSize: 13 }} noWrap>
            {storeName ? `Store: ${storeName}` : 'Store: -'}
          </Typography>

          <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
            Updated: {formatDate(reportedAt)}
          </Typography>

          <Typography sx={{ fontWeight: 900, mt: 0.5 }}>
            {price || ''}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
