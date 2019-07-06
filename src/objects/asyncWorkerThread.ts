// !Currently unused
export abstract class AsyncWorkerThread {
  abstract worker: Worker;

  private handleMessage = (
    res: (value?: MessageEvent | PromiseLike<MessageEvent>) => void
  ) => event => {
    console.log("event");
    res(event);
  };


  public start = (data: object): Promise<MessageEvent> =>
    new Promise((res, rej) => {
      const handleMessage = (event: MessageEvent) => {
        console.log("event");
        // this.worker.onmessage = undefined
        res(event);
      };
      console.log('data', data)
      this.worker.onmessage = handleMessage;
      this.worker.postMessage(data);
    });

  public end = () => {
    this.worker.terminate();
    this.worker = undefined;
  };
}
