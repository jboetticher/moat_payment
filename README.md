# MoatPayment

Simple escrow pools in a hardhat project.  
Requires [hardhat](https://hardhat.org/getting-started/#installation) to run tests. 
Follow the link to install it properly. I recommend doing so on a system like Mac, Ubuntu, or Window's WSL.  

### Running Tests
There are a couple of tests written already. Learn more about hardhat tests [here](https://hardhat.org/guides/waffle-testing.html).  
```
npx hardhat test
```

### Deployment
You can deploy using hardhat if you really want to, but with such a small project it isn't worth the setup. 
Nothing wrong with using Remix.  
```
npx hardhat compile
npx hardhat run --network mainnet deployment.js
```
