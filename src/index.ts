import express from 'express';
import fs from 'fs';
import cors from 'cors';
import Premain from './routes/Premain';
import ConfigRouter from './routes/Config';
import MovieRouter from './routes/Movies';
import path from 'path';
import { exec } from 'child_process';
import { address } from 'ip';
import TVShowRouter from './routes/TVShows';

(async () => {
  exec('sudo mount -t drvfs H: /mnt/h  ');
  exec('sudo umount /mnt/h  ');

  const app = express();

  app.use(
    cors({
      origin: '*',
    })
  );

  app.use('/pre', Premain);
  app.use('/config', ConfigRouter);
  app.use('/movies', MovieRouter);
  app.use('/tvshows', TVShowRouter);

  if (fs.existsSync('./userinfo.json')) {
    fs.readFile('./userinfo.json', (err, content) => {
      if (err) {
        console.error(err);
        return;
      }
      const json = JSON.parse(content.toString());
      console.log(path.join(json.rootdir, 'Posters'));
      app.use('/posters', express.static(path.join(json.rootdir, 'Posters')));
    });
  }

  app.get('/verify', (req, res) => {
    res.send('yes');
  });

  app.get('/getFiles', async (req, res) => {
    const drive = req.query.drive;
    if (!drive) {
      res.send('NO DRIVE PROVIDED');
      return;
    }

    fs.readdir(`/mnt/${drive}`, (err, files) => {
      if (err) {
        console.log(err);
        res.send('error');
        return;
      }

      console.log(files);
      res.send(files);
      console.log('sent');
    });
  });

  app.get('/getContent', async (req, res) => {
    const directory = req.query.dir;
    const drive = req.query.drive;

    fs.readdir(`/mnt/${drive}/${directory}`, (err, files) => {
      if (err) {
        console.log(err);
        res.send('ERROR');
        return;
      }

      console.log(files);
      res.send(files);
    });
  });

  app.listen(4000, () => {
    console.log('started server on port 4000, on ip', address());
  });
})();
