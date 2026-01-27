import { Container } from '@mui/material';

export default function ContainerSection({ children, sx }) {
  return (
    <Container
      maxWidth="lg"
      sx={{
        px: { xs: 2, md: 15 },
        ...sx,
      }}
    >
      {children}
    </Container>
  );
}
