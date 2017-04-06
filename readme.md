# Countries node in neo4j

this script is using for create countries node with some information like: `NAME`, `ISO`, `FIFA`, `DIAL`, `etc`


### USAGE:

installation
```
    npm install
```

configuration
```
    // js file
    var CONFIG = {
        NEO4J: {
            SERVER: 'bolt://localhost',   <--- change to your server
            USERNAME: 'neo4j',            <--- change to your server
            PASSWORD: 'neo4j'             <--- change to your server
        },
        ...
    };
```

run
```
    npm start
```

