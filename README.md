# node-logger
Preconfigured logger

## Cómo funciona
### Instalar

```
npm install @zorzal2/logger --save
```

### Usar

```js
import logger from '@zorzal2/logger';

// logger es el logger raíz
logger.debug('Hello world!'); // 2019-04-11T18:42:50.636-03:00 [][] DEBUG: Hello world!
logger.info('Max height:', 5 * 4, 'mm') // ... INFO: Max height 20 mm
logger.warning('Received', { status: 404 }) // ... WARNING: Received { "status": 404 }
logger.error(new TypeError('WTF!')) // ... ERROR: TypeError: WTF! at ...(stack completo)...
```

#### Logger etiquetado

Esta es la forma aceptada de usarlo. En lugar de usar la instancia principal, crear en cada módulo una subinstancia con una etiqueta que identifique quién está logueando.

```js
//Sublogger con un label:
let mylogger = logger.create('my-module')

mylogger.info('Hello') // 2019-04-11T18:42:50.636-03:00 [my-module][] INFO: Hello
```

#### Nivel de logs

El log raíz toma el nivel de la variable de entorno LOG_LEVEL, y si no existe se usa por default `all` (loguea todos los mensajes). Los valores válidos son:
all, debug, info, warning, error, none
El valor all equivale a debug a fines prácticos.

Se puede cambiar el nivel en runtime:

```js
logger.setLevel('warning'); // valores válidos: all, debug, info, warning, error, none
```
Esto afecta a todos los subloggers que se hayan creado, a menos que se les haya especificado un nivel propio.

```js
// Crea un logger con su propio nivel de error
let mylogger = logger.create('my-module', 'error')
// O se le puede asignar un nivel en cualquier momento
mylogger.setLevel('warning');
```

#### Contexto

Si existe en el [contexto](https://www.npmjs.com/package/@zorzal2/context "Paquete @zorzal2/context") la propiedad `TxID`, se coloca en las líneas de log automáticamente.
