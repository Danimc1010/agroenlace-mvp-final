import app from './app';
import { config } from './config/env';

app.listen(config.port, () => {
  console.log(`🌿 AgroEnlace API corriendo en http://localhost:${config.port}`);
});
