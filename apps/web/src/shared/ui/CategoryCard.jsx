import { Card, CardContent, Typography, Box } from '@mui/material';

const CategoryCard = ({ title, subtitle, rightSlot, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      height: 84,
    }}
  >
    <CardContent
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        '&:last-child': { pb: 2 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800 }} noWrap>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      {rightSlot ? <Box sx={{ flexShrink: 0 }}>{rightSlot}</Box> : null}
    </CardContent>
  </Card>
);

export default CategoryCard;
