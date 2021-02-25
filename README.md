# Databases:

batch-no.*

1. new (influx database)
    - stats.js (app)
        i. operationlogs
            paramter read write to PLC with user and batch no.
        
    - data.js
        i. .history
            batch rtn and compression

        ii. .average
            average data per rotation

        iii. .machine 
            operator and machine stats

2. perm 
    - index.js
        i. batchlist
            batch operator parameter new value