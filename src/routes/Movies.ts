import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const MovieRouter = Router();

MovieRouter.get('/all', (req, res) => {
  if (fs.existsSync('./userinfo.json')) {
    fs.readFile('./userinfo.json', (err, content) => {
      if (err) {
        res.send({ error: true, message: 'Error reading files' });
        return;
      }

      const fileContent = content.toString();
      const jsonFromFile = JSON.parse(fileContent);

      const moviePath = path.join(jsonFromFile.rootdir, '/Movies');
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

MovieRouter.get('/view', (req, res) => {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send('Requires Range header');
  }

  const { name } = req.query;
  fs.readFile('./userinfo.json', (err, content) => {
    if (err) {
      res.send({ error: true, message: 'NOT CONFIGURED' });
      return;
    }
    const r = new RegExp('%20', 'g');

    let fileType = 'mp4';

    fs.readdir(
      `${JSON.parse(content.toString()).rootdir}/Movies/${name}`,
      (err, files) => {
        if (err) {
          console.log(err);
        } else {
          fileType = files[0].toString().split('.')[1];

          const vidPath = path.join(
            JSON.parse(content.toString()).rootdir,
            `Movies/${name}/${name}.${fileType}`.replace(r, ' ')
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

export default MovieRouter;
