# Testing

### Compile the code:

Create dir `./test/lib/mithril-simple-modal/dev`

```bash
node ./node_modules/browserify/bin/cmd.js ./index.js > ./test/lib/mithril-simple-modal/dev/mithril-simple-modal.bundle.js
```

### Run Unit Tests

```bash
npm test
```

### Run End-to-End Tests

Currently, they are manual only. TODO: set up selenium.

```bash
npm start # start test server
```

Visit [test selection page](http://localhost:8080/test/).
