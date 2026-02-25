import { Box, Card, CardContent, CardMedia, Stack, Typography } from '@mui/material';
import { formatPrice, formatShortDate } from '../../utils/formatters';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';

const SHOW_POPULAR_FAVORITE_ICON = false;

const ReportCard = ({
  variant = 'default',
  report,
  title,
  storeName,
  price,
  imageUrl,
  reportedAt,
}) => {
  const fallbackImage = '/2.png';

  if (variant === 'popular') {
    if (!report) return null;

    return (
      <Box
        sx={{
          flex: '0 0 auto',
          width: 178,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            mb: 1.1,
          }}
        >
          <Box
            component="img"
            src={report.image_url || fallbackImage}
            alt={report.product_name || 'Product'}
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
            sx={{
              width: '100%',
              height: 116,
              borderRadius: 1.5,
              objectFit: 'cover',
              bgcolor: 'background.default',
              display: 'block',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.92)',
              display: 'grid',
              placeItems: 'center',
              visibility: SHOW_POPULAR_FAVORITE_ICON ? 'visible' : 'hidden',
            }}
          >
            <FavoriteBorderRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Box>
        </Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: 15,
            lineHeight: 1.25,
            minHeight: 36,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textAlign: 'center',
          }}
        >
          {report.product_name || '-'}
        </Typography>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 20,
            mt: 0.35,
            color: 'secondary.dark',
            textAlign: 'center',
          }}
        >
          {formatPrice(report.price, '-')}
        </Typography>
      </Box>
    );
  }

  if (variant === 'recent') {
    if (!report) return null;

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          p: 1,
          pr: 1.4,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Box
          component="img"
          src={report.image_url || fallbackImage}
          alt={report.product_name || 'Report'}
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
          sx={{
            width: 92,
            height: 92,
            borderRadius: 2.5,
            objectFit: 'cover',
            bgcolor: 'background.default',
            flex: '0 0 auto',
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 15,
              lineHeight: 1.2,
              mb: 0.45,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {report.product_name || '-'}
          </Typography>
          <Typography
            sx={{ color: 'secondary.dark', fontSize: 20, mb: 0.2, lineHeight: 1 }}
          >
            {formatPrice(report.price, '-')}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            {report.store_name ? `Store: ${report.store_name}` : 'Store: -'}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            Updated: {formatShortDate(report.reported_at, '-')}
          </Typography>
        </Box>
      </Box>
    );
  }

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
            Updated: {formatShortDate(reportedAt, '-')}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ReportCard;
