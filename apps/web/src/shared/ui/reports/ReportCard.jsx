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
        borderRadius: 3,
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

      <CardContent sx={{ flex: '1 1 50%', minWidth: 0, py: 1.2 }}>
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="text.primary"
            noWrap
          >
            {title || '-'}
          </Typography>

          <Typography
            variant="body1"
            color="secondary.dark"
            display="block"
            noWrap
          >
            {price || ''}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            noWrap
          >
            {storeName ? `Store: ${storeName}` : 'Store: -'}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Updated: {formatDate(reportedAt)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
