import { Box, Typography, Stack, Chip, IconButton } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ContainerSection from '../../shared/layout/ContainerSection';
import AppShell from '../../shared/layout/AppShell';
import PrimaryButton from '../../shared/ui/PrimaryButton';
import CategoryCard from '../../shared/ui/CategoryCard';

const categories = [
  { title: 'Product', subtitle: 'Local market' },
  { title: 'Location', subtitle: 'In store delivery' },
  { title: 'Fruits', subtitle: 'Combo price' },
  { title: 'Chicken legs', subtitle: 'Frozen meat' },
  { title: 'Milk & Dairy', subtitle: 'Process food' },
];

export default function HomePage() {
  return (
    <AppShell>
      <ContainerSection sx={{ py: 3 }}>
        {/* Hero */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              px: { xs: 3, md: 6 },
              py: { xs: 4, md: 6 },
              minHeight: { xs: 260, md: 340 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' },
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Stack spacing={2}>
              <Typography
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.05,
                  fontSize: { xs: 32, md: 44 },
                }}
              >
                We bring the store
                <br />
                to your door
              </Typography>

              <Typography sx={{ color: 'text.secondary', maxWidth: 420 }}>
                Compare groceries and find the best price across stores.
              </Typography>

              <Box>
                <PrimaryButton>Shop now</PrimaryButton>
              </Box>
            </Stack>

            {/* right "image" placeholder (나중에 실제 이미지로 교체) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  width: 260,
                  height: 260,
                  borderRadius: '36px',
                  border: '1px dashed',
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Hero Image
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Category Row */}
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              pb: { xs: 2, md: 3 },
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(5, 1fr)',
              },
              gap: 1.5,
            }}
          >
            {categories.map((c) => (
              <CategoryCard
                key={c.title}
                title={c.title}
                subtitle={c.subtitle}
                rightSlot={
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <ArrowForwardRoundedIcon fontSize="small" />
                  </IconButton>
                }
                onClick={() => {}}
              />
            ))}
          </Box>
        </Box>
      </ContainerSection>
    </AppShell>
  );
}
