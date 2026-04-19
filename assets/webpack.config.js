const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "production",

  entry: {
    app:     path.resolve(__dirname, "src/index.js"),
    profile: path.resolve(__dirname, "src/profile.js"),
  },

  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",   // → app.js, profile.js
    clean: true,
    publicPath: "auto",
  },

  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
    ],
  },

  resolve: {
    extensions: [".js", ".jsx"],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",   // → app.css, profile.css
    }),

    new ModuleFederationPlugin({
      name: "authguard",
      remotes: {
        authguardpro: `authguardpro@/wp-content/plugins/authguard-pro/build/authguardprocomponents.js`,
      },
      shared: {
        react: { singleton: true, requiredVersion: false, eager: false },
        "react-dom": { singleton: true, requiredVersion: false, eager: false },
      },
    }),
  ],
};