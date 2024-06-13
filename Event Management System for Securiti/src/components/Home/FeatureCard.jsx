import React from 'react';
import { Box, Typography } from '@mui/material';

const FeatureCard = ({ feature }) => (
  <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 4, width: '100%', color: 'white' }}>
    <Typography variant="h5" component="h3" gutterBottom>
      {feature.icon} {feature.title}
    </Typography>
    <Typography variant="body1">{feature.description}</Typography>
  </Box>
);

export default FeatureCard;
