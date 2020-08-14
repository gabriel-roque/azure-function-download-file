import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as fs from 'fs';
import * as http from 'http';

const dowloadFile = async (nameFile: string, size: string) => {
  const file = fs.createWriteStream(
    `${process.env.BASE_PATH_DOWDLOADS}/${nameFile}-${size}.zip`
  );

  http.get(`http://212.183.159.230/${size}.zip`, async function (response) {
    // http.get(`http://speedtest.tele2.net/${size}.zip`, async function (response) {
    let length = [];
    let responseData = '';

    const contentLength = parseInt(response.headers['content-length']);

    response.on('data', async (d) => {
      responseData += d;
      length.push(d.length);
      let sum = length.reduce((a, b) => a + b, 0);
      let completedParcentage = (sum / contentLength) * 100;
      console.log(
        `completed reading ${sum} bytes out of ${contentLength} bytes`
      );
      console.log(`${completedParcentage} percentage of download complete`);
    });

    response.on('end', async () => {
      file.write(responseData);
    });
  });
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const { nameFile, size } = req.query;
    await dowloadFile(nameFile, size);
    context.res.json({
      message: 'Download init, check the progress in console!',
      // fileDownloing: `http://speedtest.tele2.net/${size}.zip`,
      fileDownloing: `http://212.183.159.230/${size}.zip`,
      pathDownload: process.env.BASE_PATH_DOWDLOADS,
    });
  } catch (e) {
    context.res.json({ error: e });
  }
};

export default httpTrigger;
