export abstract class Scene {
  constructor() {}

  abstract name: string;

  abstract preload();

  abstract init();

  abstract create();

  abstract update();

  abstract unmount();

  abstract destroy();
}
