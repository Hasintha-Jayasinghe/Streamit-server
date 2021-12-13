import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const TVShowRouter = Router();

TVShowRouter.get('/all', (req, res) => {
  if (fs.existsSync('./userinfo.json')) {
    fs.readFile('./userinfo.json', (err, content) => {
      if (err) {
        res.send({ error: true, message: 'Error reading files' });
        return;
      }

      const fileContent = content.toString();
      const jsonFromFile = JSON.parse(fileContent);

      const moviePath = path.join(jsonFromFile.rootdir, '/TV Shows');
      fs.readdir(moviePath, (err, files) => {
        if (err) {
          res.send({ error: true, message: 'Error reading files' });
          return;
        }

        console.log(files);
        res.send({ error: false, files });
      });
    });
  } else {
    res.send({ error: true, message: 'Not configured' });
    return;
  }
});

TVShowRouter.get('/seasons', (req, res) => {
  const { name } = req.query;

  if (!name) return;

  if (!fs.existsSync('./userinfo.json')) return;

  fs.readFile('./userinfo.json', (err, content) => {
    if (err) {
      res.send({ error: true });
      return;
    }

    const fileContent = JSON.parse(content.toString());

    const mediaPath = path.join(fileContent.rootdir, `/TV Shows/${name}`);

    fs.readdir(mediaPath, (err, files) => {
      if (err) {
        res.send({ error: true });
        return;
      }

      res.send({ error: false, seasons: files });
    });
  });
});

TVShowRouter.get('/episodes', (req, res) => {
  const { season, name } = req.query;

  if (!name || !season) {
    res.send({ error: true });
    return;
  }

  if (!fs.existsSync('./userinfo.json')) return;

  fs.readFile('./userinfo.json', (err, content) => {
    if (err) {
      res.send({ error: true });
      return;
    }

    const fileContent = JSON.parse(content.toString());

    const mediaPath = path.join(
      fileContent.rootdir,
      `/TV Shows/${name}/Season ${season}`
    );

    fs.readdir(mediaPath, (err, files) => {
      if (err) {
        res.send({ error: true });
        return;
      }

      res.send({
        error: false,
        episodes: files.map(file => file.split('.')[0]),
      });
    });
  });
});

TVShowRouter.get('/view', (req, res) => {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send('Requires Range header');
  }

  const { name, season, episode } = req.query;
  console.log('Playing', episode);
  fs.readFile('./userinfo.json', (err, content) => {
    if (err) {
      res.send({ error: true, message: 'NOT CONFIGURED' });
      return;
    }
    const r = new RegExp('%20', 'g');

    let fileType = 'mp4';

    fs.readdir(
      `${JSON.parse(content.toString()).rootdir}/TV Shows/${name}/${season}`,
      (err, files) => {
        if (err) {
          console.log(err);
        } else {
          const file = files.filter(f => {
            return f.includes(`${episode}`);
          })[0];
          console.log('file', file);
          fileType = file.toString().split('.')[1];

          const vidPath = path.join(
            JSON.parse(content.toString()).rootdir,
            `TV Shows/${name}/${season}/${file}`.replace(r, ' ')
          );

          const videoPath = vidPath;
          const videoSize = fs.statSync(vidPath).size;

          const CHUNK_SIZE = 10 ** 6; // 1MB
          const start = Number(range!.replace(/\D/g, ''));
          const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

          const contentLength = end - start + 1;
          const headers = {
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': 'video/mp4',
          };

          res.writeHead(206, headers);

          const videoStream = fs.createReadStream(videoPath, { start, end });

          videoStream.pipe(res);
        }
      }
    );
  });
});

export default TVShowRouter;
