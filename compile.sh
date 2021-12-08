# https://ethereum.stackexchange.com/questions/38828/truffle-what-is-the-best-way-to-to-get-the-json-abi-code-after-deploying-a-cont
docker run \
  -v $(pwd)/contracts:/src:ro \
  -v $(pwd)/compiled:/build \
  ethereum/solc:0.8.3 \
  --allow-paths /src/node_modules \
  --overwrite \
  -o /build \
  --bin \
  /src/GameItemNFT.sol