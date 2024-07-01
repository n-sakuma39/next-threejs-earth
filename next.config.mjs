import withTM from "next-transpile-modules";

const nextConfig = {
  images: {
    disableStaticImages: true,
    deviceSizes: [],
    imageSizes: [],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: ["style-loader", "css-loader"],
    });
    config.module.rules.push({
      test: /\.glsl$/,
      use: "raw-loader",
    });
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
  experimental: {
    appDir: true,
  },
  future: {
    strictPostcssConfiguration: true,
  },
};

export default withTM(["three"])(nextConfig);
