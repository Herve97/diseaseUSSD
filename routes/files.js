const fileRouter = (app, fs) => {

  // variables
  const ebolaDataPath = './config/ebola.json';
  const choleraDataPath = './config/cholera.json';
  const covid19DataPath = './config/covid19.json';
  const tuberculoseDataPath = './config/tuberculose.json';
  const typhoideDataPath = './config/typhoide.json';
  const naissanceDataPath = './config/naissance.json';

  // READ EBOLA
  app.get('/api/v1/files/ebola', (req, res) => {

    fs.readFile(ebolaDataPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      res.send(JSON.parse(data));
    });

  });

  // READ COVID-19
  app.get('/api/v1/files/covid19', (req, res) => {

    fs.readFile(covid19DataPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      res.send(JSON.parse(data));
    });

  });

  // READ CHOLERA
  app.get('/api/v1/files/cholera', (req, res) => {

    fs.readFile(choleraDataPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      res.send(JSON.parse(data));
    });

  });

  // READ TUBERCULOSE
  app.get('/api/v1/files/tuberculose', (req, res) => {

    fs.readFile(tuberculoseDataPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      res.send(JSON.parse(data));
    });

  });

  // READ TYPHOÏDE
  app.get('/api/v1/files/typhoide', (req, res) => {

    fs.readFile(typhoideDataPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      res.send(JSON.parse(data));
    });

  });

   // READ NAISSANCE
  app.get('/api/v1/files/naissance', (req, res) => {

    fs.readFile(naissanceDataPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      res.send(JSON.parse(data));
    });

  });

};

module.exports = fileRouter;