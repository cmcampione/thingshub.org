# the bees are laborious

![]()

Hope

cd ./sdk

npm run build-prod 

or

npm run build-dev

./node_modules/.bin/dts-bundle-generator -o ./dist/thingshub.d.ts ./src/index.ts  --umd-module-name thingshub

--> inc version number of ./package.json and ./dist/package.json

--> git commit ad push

cd ./dist

npm publish

cd ../..
