const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  //do stuff with the webpack config...
  webpack: function (config, env) {
    // ...add your webpack config
    config.plugins = [
      new NodePolyfillPlugin({
        excludeAliases: ["console"],
      }),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        filename: "./index.html",
        favicon: "./public/favicon.ico",
      }),
    ];

    config.module = {
      rules: [
        {
          // test: /\.tsx?$/,
          test: /\.js$|jsx/,
          exclude: /node_modules/,
          loader: "babel-loader",
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
          exclude: /node_modules/,
          use: ["file-loader?name=[name].[ext]"],
        },
      ],
    };

    config.resolve = {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      fallback: {
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        // assert: require.resolve("assert/"),
        // https: require.resolve("https-browserify"),
        // crypto: require.resolve("crypto-browserify"),
        // buffer: require.resolve("buffer/"),
        // http: require.resolve("stream-http"),
        // stream: require.resolve("stream-browserify"),
        // os: require.resolve("os-browserify/browser"),
        // zlib: require.resolve("browserify-zlib"),
        // path: require.resolve("path-browserify"),
      },
    };

    return config;
  },
};
