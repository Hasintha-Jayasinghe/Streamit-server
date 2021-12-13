import { Router } from 'express';
import fs from 'fs';
import ip from 'ip';

const ConfigRouter = Router();

ConfigRouter.post('/server', async (req, res) => {
  const { drive, dir } = req.query;

  fs.writeFile(
    './userinfo.json',
    JSON.stringify({
      rootdir: `/mnt/${drive}/${dir}`,
      serverIp: ip.address().toString(),
    }),
    err => {
      if (err) {
        res.send({ completed: false });
        return;
      }
    }
  );
  res.send({ completed: true, serverIp: ip.address().toString() });
});

export default ConfigRouter;
