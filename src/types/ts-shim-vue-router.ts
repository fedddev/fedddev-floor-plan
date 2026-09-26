// https://stackoverflow.com/questions/63999118/how-to-declare-typescript-type-interface-for-custom-meta-fields-in-vue-router-v4
// Ensure this file is parsed as a module regardless of dependencies.
import { App } from 'vue';

declare module 'vue-router' {
  interface Router {
    app?: App<Element>
  }
}