# platziverse-db

## Usage

``` js

const setupDatabase = require('platziverse-db')

setupDatabase(config).then(db => {
    const {Agent, metric } = db

}).catch(err => console.error(err))

```

Falta: pruebas metric

reto del script de setup para que reciba como arg --y y salte la pregunta