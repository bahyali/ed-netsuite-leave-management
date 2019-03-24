const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path')

module.exports = {
    mode: 'development',
    output: {
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].bundle.map'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js", ".d.ts"],
        plugins: [
            new TsconfigPathsPlugin()
        ],
        alias: {
            N: path.resolve(__dirname, 'node_modules/@hitc/netsuite-types/N/'),
        }
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules|\.d\.ts$/},
            {
                test: /\.d\.ts$/,
                loader: 'ignore-loader'
            }
        ]
    }
}