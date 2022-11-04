# MANA & LAND Holders vs DAO Members Comparison

LAND & ESTATE holders data comes from the etherscan csv available for download at: 
 - https://etherscan.io/token/0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d#balances
 - https://etherscan.io/token/0x959e104e1a4db6317fa58f8295f586e1a978c297#balances

The data should be transformed to a JSON via https://csvjson.com/csv2json and the array elements must have the format: 

```
{
  address: string
  amount: number
}
```

1) Save the files into a folder called `data` in the root directory
2) Run `npm install` command
3) Run `npx ts-node manaFetch.ts` to get the data about MANA holders
4) Run `npx ts-node calculate.ts` to do the calculation