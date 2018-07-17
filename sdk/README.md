# the bees are laborious

![]()

Hope

cd ./sdk

"npm run build-prod" or "npm run build-dev"

--> only once install https://www.npmjs.com/package/dts-bundle-generator
--> npm i dts-bundle-generator -g

dts-bundle-generator -o ./dist/thingshub.d.ts ./src/index.ts  --umd-module-name thingshub

--> inc version number of ./package.json and ./dist/package.json

--> git commit ad push

cd ./dist

npm publish

cd ../..
