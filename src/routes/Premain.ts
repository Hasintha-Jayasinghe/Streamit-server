import { Router } from 'express';
import fs from 'fs';

const router = Router();

router.get('/programinfo', async (req, res) => {
  const dir = fs.readdir('./', (err, file) => {
    console.log(file);
  });
  const configured = fs.existsSync('./userinfo.json');

  if (configured) {
    fs.readFile('./userinfo.json', (err, file) => {
      if (err) {
        res.send({ error: true, completed: false });
        return;
      }

      console.log(file.toString());
      const json = JSON.parse(file.toString());
      res.send({ error: false, completed: true, ip: json.serverIp });
    });
    return;
  }

  res.send({
    configured: false,
  });
});

export default router;
