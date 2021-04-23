npm init
npm install extra-watch-webpack-plugin file-loader jszip ts-loader typescript webpack webpack-cli

mkdir data
mkdir src
mkdir dist

cp ../sleek/*.sh .
cp ../sleek/.gitignore .
cp ../sleek/src/index.html src
cp ../sleek/dist/*icon* dist 
cp ../sleek/dist/sw.js dist 
cp ../sleek/src/manifest.webmanifest src

cd src
ln -s ../../sleek/src/sleek sleek
touch index.ts

cd ..
cp ../sleek/webpack.config.js .
cp ../sleek/tsconfig.json .
cp ../sleek/data/version.json data


echo Now:
echo 1 Create build tasks in package.json
echo 2 Edit data/version.json
echo 3 Edit release.sh for release process
