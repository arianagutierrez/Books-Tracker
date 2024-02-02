const path = require('path');
const DotenvWebpackPlugin = require('dotenv-webpack');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
  
    return {
      entry: './src/index.js',
      output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
      },
      module: {
        rules: [
          {
            test: /\.s[ac]ss$/i,
            use: ['style-loader', 'css-loader', 'sass-loader'],
          },
          {
            test: /\.(png|jpg|ico)$/i,
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images',
            },
          },
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        [
                          '@babel/preset-env',
                        ],
                      ],
                },
            },
          },
        ],
      },
      plugins: [
        new DotenvWebpackPlugin(),
      ],
      resolve: {
        alias: {
          firebase: 'firebase',
        },
      },
      experiments: {
        outputModule: true,
      },
      devtool: isProduction ? 'source-map' : 'inline-source-map',
    };
}