import { Container } from '@mui/material';

const ContainerSection = ({ children, sx }) => (
  <Container
    maxWidth="lg"
    sx={{
      px: { xs: 1.25, sm: 2, md: 15 },
      ...sx,
    }}
  >
    {children}
  </Container>
);

export default ContainerSection;
