var path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: [
    "babel-polyfill",
     "./src/app.js",
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js"
    // publicPath: "/dist"
  },
  resolve: {
    modules: ["node_modules"],
    extensions: [".js", ".scss"]
  },
  module: {
    rules: [
      // {
      //   test: /\.(gif|png|jpe?g|svg)$/i,
      //   use: ["file-loader"]
      // },
      {
        test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        loader: 'file-loader?name=[name].[ext]'  // <-- retain original file name
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"]
            }
          }
        ]
      },
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: "style-loader" // inject CSS to page
          },
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader" // translates CSS into CommonJS modules
          },
          {
            loader: "postcss-loader", // Run post css actions
            options: {
              plugins: function() {
                // post css plugins, can be exported to postcss.config.js
                return [require("precss"), require("autoprefixer"), require("cssnano")];
              }
            }
          },
          {
            loader: "sass-loader" // compiles Sass to CSS
          }
        ]
      }
      // {
      //   test: /\.scss$/,
      //   use: [
      //     "style-loader",
      //     MiniCssExtractPlugin.loader,
      //     "css-loader",
      //     "sass-loader"
      //   ]
      // }
    ]
  },
  optimization: {
    minimize: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html"
    }),
    new CleanWebpackPlugin(["dist"]),
    // new webpack.HotModuleReplacementPlugin()
    new MiniCssExtractPlugin({
      filename: "style.css"
    }),
  ]
};
