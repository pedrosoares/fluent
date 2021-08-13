import "core-js/stable";
import "regenerator-runtime/runtime";
import { Model } from './model';
import { Configurator } from "./configurator";

const configurator = new Configurator();

export { Model, configurator };
