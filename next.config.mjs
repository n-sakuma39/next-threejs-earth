import withTM from "next-transpile-modules";

const nextConfig = {
  images: {
    disableStaticImages: true,
    deviceSizes: [],
    imageSizes: [],
  },
};

export default withTM(["three"])({
  ...nextConfig,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: ["style-loader", "css-loader"],
    });
    config.module.rules.push({
      test: /\.glsl$/,
      use: "raw-loader",
    });
    // 画像ファイル用のローダーを追加
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|ico|bmp|tiff)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "[name].[hash].[ext]",
            outputPath: "static/assets/",
            publicPath: "/_next/static/assets/",
          },
        },
      ],
    });
    return config;
  },
});
