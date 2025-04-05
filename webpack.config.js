const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const nodeExternals = require('webpack-node-externals');

// 判断是否为生产环境
const isProduction = process.env.NODE_ENV === 'production';
// 判断是否为SSR构建
const isSSR = process.env.SSR === 'true';

// 客户端配置
const clientConfig = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/entry-client.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? 'assets/js/[name].[contenthash:8].js' : 'assets/js/[name].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              transpileOnly: true
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: 'compressed',
              },
              implementation: require('sass'),
              api: 'modern'
            },
          },
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024 // 4kb
          }
        },
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[hash:8][ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
      title: 'StarMall电商网站',
      meta: {
        description: '基于Vue3的现代电商网站，提供优质购物体验'
      }
    }),
    new WebpackManifestPlugin({
      fileName: 'ssr-manifest.json'
    })
  ],
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial'
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    }
  }
};

// 生产环境添加CSS提取插件
if (isProduction) {
  clientConfig.plugins.push(
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].[contenthash:8].css',
      chunkFilename: 'assets/css/[name].[contenthash:8].css'
    })
  );
}

// 服务器端配置
const serverConfig = {
  mode: 'production',
  entry: './src/entry-server.ts',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist/server'),
    filename: 'entry-server.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              transpileOnly: true
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['null-loader']
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          'null-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: 'compressed',
              },
              implementation: require('sass'),
              api: 'modern'
            },
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|woff2?|eot|ttf|otf)$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  externals: [nodeExternals({
    allowlist: [/\.css$/, /\?vue&type=style/]
  })]
};

// 根据环境导出不同配置
module.exports = isSSR ? serverConfig : clientConfig;