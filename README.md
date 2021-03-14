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
        ii. recipielist
        iii. user


curl -G 'http://localhost:8086/query?pretty=true' --data-urlencode "db=new" --data-urlencode "q=SELECT \"batch\" FROM \"operationlogs\""

curl -G 'http://localhost:8086/query?db=new' --data-urlencode 'q=SELECT * FROM "operationlogs"'

curl -G 'http://localhost:8086/query?pretty=true' --data-urlencode "db=new" --data-urlencode 'q=SELECT * FROM "operationlogs"'

Database write:

curl -i -XPOST 'http://localhost:8086/write?db=perm' --data-binary 'recipielist,name=server01,product=us-west thickness=0.64,size=10,weight=10'

fetch('http://localhost:8086/write?db=mydb', {
                method: 'POST',
                body: 'cpu_load_short,host=server01,region=us-west value=0.64'})
                .catch(function (error) {
                    // If there is any error you will catch them here
                    console.log("[ PAYLOAD FETCH ERROR ]", error)
                });;

Database read:

http://localhost:8086/query?pretty=true&db=new&q=select%20*%20from%20%22operationlogs%22%20where%20%22batch%22%20=%20%27${batchnumber}%27