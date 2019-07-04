declare module "worker-loader?publicPath=dist/*" {
  function worker(): Worker;
  export = worker
}